import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { PokemonListResponse, TypeDetail } from '../pokeapi/pokeapi.interfaces';
import { Cache } from 'cache-manager';

interface SimplifiedPokemon {
  id: number;
  name: string;
  frontImage: string | null;
  backImage: string | null;
  types: string[];
  weaknesses: string[];
  region: string | null;
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    private readonly pokeapiService: PokeapiService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
  ) {}

  async findAll(
    options: { ignoreCache?: boolean; limit?: number; offset?: number } = {
      ignoreCache: false,
      limit: 20,
      offset: 0,
    },
  ): Promise<PokemonListResponse> {
    const { limit = 20, offset = 0 } = options;

    this.logger.verbose(
      `Fetching Pokemon names with limit: ${limit}, offset: ${offset}`,
    );

    let pokemonNames: string[] = [];

    if (options.ignoreCache) {
      return await this.pokeapiService.fetchPokemonList(limit, offset);
    }

    const cacheKey = `allPokemonNames`;
    const cachedPokemonNames = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedPokemonNames) {
      pokemonNames = cachedPokemonNames.slice(offset, offset + limit);
      this.logger.verbose(
        `Found cached Pokemon names for limit: ${limit}, offset: ${offset}: ${JSON.stringify(
          pokemonNames,
        )}`,
      );
    }

    if (pokemonNames.length === 0) {
      this.logger.warn(
        `No Pokemon names found for limit: ${limit}, offset: ${offset}`,
      );
      return { count: 0, results: [], next: null, previous: null };
    }

    return {
      count: pokemonNames.length,
      results: pokemonNames.map((name) => ({
        name,
        url: `https://pokeapi.co/api/v2/pokemon/${name}`,
      })),
      next: String(
        offset + limit < pokemonNames.length ? offset + limit : null,
      ),
      previous: String(offset > 0 ? offset - limit : null),
    };
  }

  async findOne(
    idOrName: number | string,
    options: { ignoreCache?: boolean } = { ignoreCache: false },
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
        frontImage: pokemonDetails.sprites.front_default,
        backImage: pokemonDetails.sprites.back_default,
        types: pokemonDetails.types.map((typeInfo) => typeInfo.type.name),
        weaknesses: actualWeaknesses,
        region: regionName,
      };

      if (!options.ignoreCache) {
        const cacheKey = `pokemon:${idOrName}`;

        await this.cacheManager.set(cacheKey, simplifiedPokemon);
        this.logger.verbose(
          `Cached Pokemon ${idOrName} with key ${cacheKey}: ${JSON.stringify(
            simplifiedPokemon,
          )}`,
        );
      }
      return simplifiedPokemon;
    } catch (error) {
      this.logger.error(
        `Error processing findOne for ${idOrName}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.log(`Retry to fetch Pokemon ${idOrName} from PokeAPI...`);
      try {
        return await this.findOne(idOrName, { ignoreCache: true });
      } catch (retryError) {
        throw new Error(
          `Could not process data for Pokemon ${idOrName}, retry failed: ${retryError}`,
        );
      }
    }
  }
}
