import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map, catchError, of } from 'rxjs';
import { AxiosError } from 'axios';
import {
  PokemonListResponse,
  PokemonDetailResponse,
  TypeDetailResponse,
  PokemonSpeciesResponse,
  GenerationResponse,
  TypeDamageRelations,
} from './pokeapi.interfaces';

@Injectable()
export class PokeapiService {
  private readonly logger = new Logger(PokeapiService.name);

  private readonly pokeApiBaseUrl =
    process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async fetchPokemonList(
    limit: number = 20,
    offset: number = 0,
  ): Promise<PokemonListResponse> {
    const url = `${this.pokeApiBaseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    this.logger.verbose(`Fetching Pokemon list from: ${url}`);

    return firstValueFrom(
      this.httpService.get<PokemonListResponse>(url).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Error fetching Pokemon list from ${url}: ${error.message}`,
            error.stack,
          );
          throw new Error(`PokeAPI Error: Could not fetch Pokemon list.`);
        }),
      ),
    );
  }

  async fetchPokemonDetails(
    idOrName: number | string,
  ): Promise<PokemonDetailResponse> {
    const url = `${this.pokeApiBaseUrl}/pokemon/${idOrName}`;
    this.logger.verbose(`Fetching Pokemon details from: ${url}`);

    return firstValueFrom(
      this.httpService.get<PokemonDetailResponse>(url).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Error fetching Pokemon ${idOrName} from ${url}: ${error.message}`,
            error.stack,
          );
          if (error.response?.status === 404) {
            throw new NotFoundException(
              `Pokemon with ID or name "${idOrName}" not found in PokeAPI`,
            );
          }
          throw new Error(
            `PokeAPI Error: Could not fetch details for Pokemon ${idOrName}.`,
          );
        }),
      ),
    );
  }

  async fetchTypeDetails(typeUrl: string): Promise<TypeDamageRelations | null> {
    this.logger.verbose(`Fetching type details from: ${typeUrl}`);

    return firstValueFrom(
      this.httpService.get<TypeDetailResponse>(typeUrl).pipe(
        map((res) => res.data.damage_relations),
        catchError((error: AxiosError) => {
          this.logger.warn(
            `Error fetching type details from ${typeUrl}: ${error.message}. Returning null for damage relations.`,
            error.stack,
          );
          return of(null);
        }),
      ),
    );
  }

  async fetchSpeciesDetails(
    idOrName: number | string,
  ): Promise<PokemonSpeciesResponse | null> {
    const url = `${this.pokeApiBaseUrl}/pokemon-species/${idOrName}`;
    this.logger.verbose(`Fetching species data from: ${url}`);

    return firstValueFrom(
      this.httpService.get<PokemonSpeciesResponse>(url).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          this.logger.warn(
            `Error fetching species data for ${idOrName} from ${url}: ${error.message}. Returning null.`,
            error.stack,
          );
          return of(null);
        }),
      ),
    );
  }

  async fetchGenerationDetails(
    generationUrl: string,
  ): Promise<GenerationResponse> {
    this.logger.verbose(`Fetching generation data from: ${generationUrl}`);

    return firstValueFrom(
      this.httpService.get<GenerationResponse>(generationUrl).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Error fetching generation data from ${generationUrl}: ${error.message}`,
            error.stack,
          );
          throw new Error(
            `PokeAPI Error: Could not fetch generation data from ${generationUrl}.`,
          );
        }),
      ),
    );
  }
}
