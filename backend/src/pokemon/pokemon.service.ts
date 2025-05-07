import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { PokemonListResponse, TypeDetail } from '../pokeapi/pokeapi.interfaces';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SimplifiedPokemon {
  id: number;
  name: string;
  frontImage: string | null;
  backImage: string | null;
  types: string[];
  weaknesses: string[];
  region: string | null;
  originalImages: {
    front: string | null;
    back: string | null;
  };
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    private readonly pokeapiService: PokeapiService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async findAll(
    options: { ignoreCache?: boolean; limit?: number; offset?: number } = {
      ignoreCache: false,
      limit: 20,
      offset: 0,
    },
  ): Promise<PokemonListResponse> {
    const { limit = 10, offset = 0 } = options;

    this.logger.verbose(
      `Fetching Pokemon names with limit: ${limit}, offset: ${offset}`,
    );

    let pokemonNames: string[] = [];

    if (options.ignoreCache) {
      return {
        ...(await this.pokeapiService.fetchPokemonList(limit, offset)),
        next: String(offset + limit),
        previous: String(offset - limit >= 0 ? offset - limit : 0),
      };
    }

    const cacheKey = `allPokemonNames`;
    const cachedPokemonNames = await this.cacheManager.get<string[]>(cacheKey);
    if (!cachedPokemonNames) {
      this.logger.warn(
        `No cached Pokemon names found. Proceeding to fetch from PokeAPI.`,
      );
      return {
        ...(await this.pokeapiService.fetchPokemonList(limit, offset)),
        next: String(offset + limit),
        previous: String(offset - limit >= 0 ? offset - limit : 0),
      };
    }

    pokemonNames = cachedPokemonNames.slice(offset, offset + limit);
    this.logger.verbose(
      `Found cached Pokemon names for limit: ${limit}, offset: ${offset}: ${JSON.stringify(
        pokemonNames,
      )}`,
    );

    return {
      count: cachedPokemonNames?.length || 0,
      results: pokemonNames.map((name) => ({
        name,
      })),
      next: String(offset + limit),
      previous: String(offset - limit >= 0 ? offset - limit : 0),
    };
  }

  async findOne(
    idOrName: number | string,
    options: { ignoreCache?: boolean; isRetry?: boolean } = {
      ignoreCache: false,
    },
  ): Promise<SimplifiedPokemon> {
    this.logger.verbose(`Processing findOne for Pokemon: ${idOrName}`);

    if (!options.ignoreCache) {
      const cacheKey = `pokemon:${idOrName}`;
      const cachedPokemon =
        await this.cacheManager.get<SimplifiedPokemon>(cacheKey);
      if (cachedPokemon) {
        this.logger.verbose(
          `Found cached Pokemon for ${idOrName}: ${JSON.stringify(
            cachedPokemon,
          )}`,
        );
        return cachedPokemon;
      }
      this.logger.debug(
        `No cached Pokemon found for ${idOrName}. Proceeding to fetch from PokeAPI.`,
      );
    }

    try {
      const pokemonDetails =
        await this.pokeapiService.fetchPokemonDetails(idOrName);

      const speciesPromise = this.pokeapiService.fetchSpeciesDetails(idOrName);

      const typeDetailsPromises = pokemonDetails.types.map((typeInfo) =>
        this.pokeapiService.fetchTypeDetails(typeInfo.type.url),
      );

      const [speciesData, typeDamageRelationsResults] = await Promise.all([
        speciesPromise,
        Promise.all(typeDetailsPromises),
      ]);

      const validDamageRelations = typeDamageRelationsResults.filter(
        (relations) => relations !== null,
      );

      const potentialWeaknesses = new Set<string>();
      const resistancesAndImmunities = new Set<string>();

      validDamageRelations.forEach((relations) => {
        relations.double_damage_from.forEach((type: TypeDetail) =>
          potentialWeaknesses.add(type.name),
        );
        relations.half_damage_from.forEach((type: TypeDetail) =>
          resistancesAndImmunities.add(type.name),
        );
        relations.no_damage_from.forEach((type: TypeDetail) =>
          resistancesAndImmunities.add(type.name),
        );
      });

      const actualWeaknesses = [...potentialWeaknesses].filter(
        (weakness) => !resistancesAndImmunities.has(weakness),
      );
      this.logger.verbose(
        `Calculated actual weaknesses for ${idOrName}: ${actualWeaknesses.join(', ')}`,
      );

      let regionName: string | null = null;
      if (speciesData?.generation?.url) {
        try {
          const generationData =
            await this.pokeapiService.fetchGenerationDetails(
              speciesData.generation.url,
            );
          regionName = generationData.main_region.name;
          this.logger.verbose(
            `Determined region for ${idOrName}: ${regionName}`,
          );
        } catch (error) {
          this.logger.warn(
            `Could not fetch generation data for ${idOrName} from ${speciesData.generation.url}. Proceeding without region. Error: ${error instanceof Error ? error.message : error}`,
          );
        }
      } else {
        this.logger.verbose(
          `Could not determine region for ${idOrName} (missing species or generation URL).`,
        );
      }

      const simplifiedPokemon: SimplifiedPokemon = {
        id: pokemonDetails.id,
        name: pokemonDetails.name,
        originalImages: {
          front: pokemonDetails.sprites.front_default,
          back: pokemonDetails.sprites.back_default,
        },
        frontImage: pokemonDetails.sprites.front_default
          ? `${process.env.API_URL}/pokemon/${idOrName}/front-image`
          : null,
        backImage: pokemonDetails.sprites.back_default
          ? `${process.env.API_URL}/pokemon/${idOrName}/back-image`
          : null,
        types: pokemonDetails.types.map((typeInfo) => typeInfo.type.name),
        weaknesses: actualWeaknesses,
        region: regionName,
      };

      const cacheKey = `pokemon:${idOrName}`;
      const frontImageCacheKey = `pokemon:${idOrName}:frontImage`;
      const backImageCacheKey = `pokemon:${idOrName}:backImage`;

      await this.cacheManager.set(cacheKey, simplifiedPokemon);
      this.logger.verbose(
        `Cached Pokemon ${idOrName} with key ${cacheKey}: ${JSON.stringify(
          simplifiedPokemon,
        )}`,
      );

      const imagePromises: Promise<void | Buffer>[] = [];

      if (pokemonDetails.sprites.front_default) {
        imagePromises.push(
          this.fetchAndCacheImage(
            pokemonDetails.sprites.front_default,
            frontImageCacheKey,
            idOrName,
            'front',
          ),
        );
      }

      if (pokemonDetails.sprites.back_default) {
        imagePromises.push(
          this.fetchAndCacheImage(
            pokemonDetails.sprites.back_default,
            backImageCacheKey,
            idOrName,
            'back',
          ),
        );
      }

      await Promise.allSettled(imagePromises);

      return simplifiedPokemon;
    } catch (error) {
      this.logger.error(
        `Error processing findOne for ${idOrName}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (!options.isRetry) {
        this.logger.log(`Retry to fetch Pokemon ${idOrName} from PokeAPI...`);
        try {
          return await this.findOne(idOrName, {
            ignoreCache: true,
            isRetry: true,
          });
        } catch (retryError) {
          throw new Error(
            `Could not process data for Pokemon ${idOrName}, retry failed: ${retryError}, ${(retryError as Error).stack}`,
          );
        }
      }
      throw error;
    }
  }

  async getImage(
    idOrName: number | string,
    imageType: 'front' | 'back',
  ): Promise<Buffer> {
    const cacheKey = `pokemon:${idOrName}:${imageType}Image`;
    const cachedImage = await this.cacheManager.get<Buffer>(cacheKey);
    if (cachedImage) {
      this.logger.verbose(
        `Found cached ${imageType} image for ${idOrName}: ${cachedImage.byteLength} bytes`,
      );
      return cachedImage;
    }

    this.logger.warn(
      `No cached ${imageType} image found for ${idOrName}. Proceeding to fetch from PokeAPI.`,
    );

    let pokemon: SimplifiedPokemon | undefined;

    try {
      pokemon = await this.findOne(idOrName);
    } catch (error) {
      this.logger.error(
        `Error fetching Pokemon ${idOrName} for image retrieval: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }

    if (pokemon?.originalImages[`${imageType}`]) {
      const imageUrl = pokemon.originalImages[`${imageType}`]!;
      const image = await this.fetchAndCacheImage(
        imageUrl,
        cacheKey,
        idOrName,
        imageType,
      );

      if (image) {
        this.logger.verbose(
          `Fetched and cached ${imageType} image for ${idOrName}: ${image.byteLength} bytes`,
        );
        return image;
      }
    }

    throw new NotFoundException(`No cached image found for ${idOrName}`);
  }

  private async fetchAndCacheImage(
    imageUrl: string,
    cacheKey: string,
    pokemonIdOrName: string | number,
    imageType: 'front' | 'back',
  ): Promise<Buffer | undefined> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(imageUrl, { responseType: 'arraybuffer' }),
      );
      const imageData = Buffer.from(response.data);
      await this.cacheManager.set(cacheKey, imageData);
      this.logger.verbose(
        `Cached ${imageType} image binary for ${pokemonIdOrName} with key ${cacheKey} (${imageData.byteLength} bytes)`,
      );
      return imageData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch or cache ${imageType} image from ${imageUrl} for ${pokemonIdOrName}: ${(error as Error).message}`,
      );
    }
  }
}
