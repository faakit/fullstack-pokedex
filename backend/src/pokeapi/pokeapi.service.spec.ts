/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PokeapiService } from './pokeapi.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { NotFoundException } from '@nestjs/common';
import {
  PokemonDetailResponse,
  PokemonListResponse,
} from './pokeapi.interfaces';

describe('PokeapiService', () => {
  let service: PokeapiService;
  let httpService: HttpService;
  const pokeApiBaseUrl = 'https://pokeapi.co/api/v2';

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokeapiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<PokeapiService>(PokeapiService);
    httpService = module.get<HttpService>(HttpService);

    // @ts-expect-error we are mocking the base URL by assigning it directly
    service.pokeApiBaseUrl = pokeApiBaseUrl;
    jest.clearAllMocks();
  });

  describe('fetchPokemonDetails', () => {
    it('should fetch and return pokemon details successfully', async () => {
      const idOrName = 'pikachu';
      const expectedUrl = `${pokeApiBaseUrl}/pokemon/${idOrName}`;
      const mockResponseData: PokemonDetailResponse = {
        id: 25,
        name: 'pikachu',
        species: {
          name: 'pikachu',
          url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
        },
        sprites: {
          front_default: 'https://pokeapi.co/media/sprites/pokemon/25.png',
          back_default: 'https://pokeapi.co/media/sprites/pokemon/back/25.png',
        },
        types: [
          {
            slot: 1,
            type: {
              name: 'electric',
              url: 'https://pokeapi.co/api/v2/type/13/',
            },
          },
        ],
      };
      const mockAxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: { headers: {} as any },
      } as AxiosResponse<PokemonDetailResponse>;

      mockHttpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const result = await service.fetchPokemonDetails(idOrName);

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponseData);
    });

    it('should throw NotFoundException when PokeAPI returns 404', async () => {
      const idOrName = 'unknown';
      const expectedUrl = `${pokeApiBaseUrl}/pokemon/${idOrName}`;
      const mockError: Partial<AxiosError> = {
        message: 'Not Found',
        response: {
          data: 'Not Found',
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: { headers: {} as any },
        },
        isAxiosError: true,
        name: 'AxiosError',
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(throwError(() => mockError));

      await expect(service.fetchPokemonDetails(idOrName)).rejects.toThrow(
        new NotFoundException(
          `Pokemon with ID or name "${idOrName}" not found in PokeAPI`,
        ),
      );
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should throw a generic Error for other Axios errors', async () => {
      const idOrName = 'error-pokemon';
      const expectedUrl = `${pokeApiBaseUrl}/pokemon/${idOrName}`;
      const mockError: Partial<AxiosError> = {
        message: 'Internal Server Error',
        response: {
          data: 'Server Error',
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: { headers: {} as any },
        },
        isAxiosError: true,
        name: 'AxiosError',
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(throwError(() => mockError));

      await expect(service.fetchPokemonDetails(idOrName)).rejects.toThrow(
        new Error(
          `PokeAPI Error: Could not fetch details for Pokemon ${idOrName}.`,
        ),
      );
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should throw a generic Error for non-Axios errors during request', async () => {
      const idOrName = 'network-error-pokemon';
      const expectedUrl = `${pokeApiBaseUrl}/pokemon/${idOrName}`;
      const mockError = new Error('Network Error'); // Simulate a non-Axios error

      mockHttpService.get.mockReturnValueOnce(throwError(() => mockError));

      await expect(service.fetchPokemonDetails(idOrName)).rejects.toThrow(
        // Depending on how catchError handles non-Axios errors, adjust the expected error
        // In this implementation, it should still fall into the generic error handler
        new Error(
          `PokeAPI Error: Could not fetch details for Pokemon ${idOrName}.`,
        ),
      );
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('fetchPokemonList', () => {
    it('should fetch and return a list of pokemon successfully', async () => {
      const limit = 10;
      const offset = 5;
      const expectedUrl = `${pokeApiBaseUrl}/pokemon?limit=${limit}&offset=${offset}`;
      const mockResponseData: PokemonListResponse = {
        count: 1118,
        next: `${pokeApiBaseUrl}/pokemon?offset=15&limit=10`,
        previous: `${pokeApiBaseUrl}/pokemon?offset=-5&limit=10`, // Example, actual API might handle differently
        results: [
          { name: 'pidgeot', url: `${pokeApiBaseUrl}/pokemon/18/` },
          { name: 'rattata', url: `${pokeApiBaseUrl}/pokemon/19/` },
        ],
      };
      const mockAxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      } as AxiosResponse<PokemonListResponse>;

      mockHttpService.get.mockReturnValueOnce(of(mockAxiosResponse));

      const result = await service.fetchPokemonList(limit, offset);

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponseData);
    });

    it('should throw a generic Error when fetching pokemon list fails', async () => {
      const limit = 20;
      const offset = 0;
      const expectedUrl = `${pokeApiBaseUrl}/pokemon?limit=${limit}&offset=${offset}`;
      const mockError: Partial<AxiosError> = {
        message: 'Internal Server Error',
        response: {
          data: 'Server Error',
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: { headers: {} as any },
        },
        isAxiosError: true,
        name: 'AxiosError',
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(throwError(() => mockError));

      await expect(service.fetchPokemonList(limit, offset)).rejects.toThrow(
        new Error('PokeAPI Error: Could not fetch Pokemon list.'),
      );
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
