/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService, SimplifiedPokemon } from './pokemon.service';
import { NotFoundException } from '@nestjs/common';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockPokeapiService = {
  fetchPokemonDetails: jest.fn(),
  fetchSpeciesDetails: jest.fn(),
  fetchTypeDetails: jest.fn(),
  fetchGenerationDetails: jest.fn(),
  fetchPokemonList: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
};

describe('PokemonService', () => {
  let service: PokemonService;
  let cacheManager: Cache;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: PokeapiService, useValue: mockPokeapiService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('getImage', () => {
    const idOrName = 'pikachu';
    const frontImageType = 'front';
    const backImageType = 'back';
    const frontCacheKey = `pokemon:${idOrName}:${frontImageType}Image`;
    const backCacheKey = `pokemon:${idOrName}:${backImageType}Image`;
    const mockImageBuffer = Buffer.from('mock image data');

    it('should return the cached front image buffer if found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockImageBuffer);

      const result = await service.getImage(idOrName, frontImageType);

      expect(cacheManager.get).toHaveBeenCalledWith(frontCacheKey);
      expect(result).toBeInstanceOf(Buffer);
      expect(result).toEqual(mockImageBuffer);
    });

    it('should return the cached back image buffer if found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockImageBuffer);

      const result = await service.getImage(idOrName, backImageType);

      expect(cacheManager.get).toHaveBeenCalledWith(backCacheKey);
      expect(result).toBeInstanceOf(Buffer);
      expect(result).toEqual(mockImageBuffer);
    });

    it('should throw NotFoundException if the image is not in cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getImage(idOrName, frontImageType)).rejects.toThrow(
        NotFoundException,
      );

      expect(cacheManager.get).toHaveBeenCalledWith(frontCacheKey);
    });

    it('should throw NotFoundException with specific message if image not found', async () => {
      const testId = 'mewtwo';
      const testImageType = 'back';
      const testCacheKey = `pokemon:${testId}:${testImageType}Image`;
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      await expect(service.getImage(testId, testImageType)).rejects.toThrow(
        `No cached image found for ${testId}`,
      );
      expect(cacheManager.get).toHaveBeenCalledWith(testCacheKey);
    });
  });

  describe('findOne', () => {
    const idOrName = 'pikachu';
    const cacheKey = `pokemon:${idOrName}`;
    const frontImageCacheKey = `pokemon:${idOrName}:frontImage`;
    const backImageCacheKey = `pokemon:${idOrName}:backImage`;
    const mockPokemonDetails = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'original_front_url',
        back_default: 'original_back_url',
      },
      types: [
        { slot: 1, type: { name: 'electric', url: 'type_electric_url' } },
      ],
    };
    const mockSpeciesDetails = {
      generation: { name: 'generation-i', url: 'gen_1_url' },
    };
    const mockTypeDetailsElectric = {
      double_damage_from: [{ name: 'ground', url: 'type_ground_url' }],
      half_damage_from: [
        { name: 'flying', url: 'type_flying_url' },
        { name: 'steel', url: 'type_steel_url' },
        { name: 'electric', url: 'type_electric_url' },
      ],
      no_damage_from: [],
    };
    const mockGenerationDetails = {
      main_region: { name: 'kanto', url: 'region_kanto_url' },
    };
    const mockSimplifiedPokemon: SimplifiedPokemon = {
      id: 25,
      name: 'pikachu',
      frontImage: 'front_url',
      backImage: 'back_url',
      originalImages: {
        front: 'original_front_url',
        back: 'original_back_url',
      },
      types: ['electric'],
      weaknesses: ['ground'],
      region: 'kanto',
    };
    const mockImageBuffer = Buffer.from('mock image data');
    const mockHttpResponse = {
      data: mockImageBuffer,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    it('should return cached pokemon data if found', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockSimplifiedPokemon);

      const result = await service.findOne(idOrName);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockSimplifiedPokemon);
      expect(mockPokeapiService.fetchPokemonDetails).not.toHaveBeenCalled();
    });

    it('should fetch from API, calculate details, cache, and return data if not found in cache', async () => {
      const expectedPokemon = {
        ...mockSimplifiedPokemon,
        backImage: `${process.env.API_URL}/pokemon/pikachu/back-image`,
        frontImage: `${process.env.API_URL}/pokemon/pikachu/front-image`,
      };

      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      (cacheManager.get as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);
      mockPokeapiService.fetchPokemonDetails.mockResolvedValue(
        mockPokemonDetails,
      );
      mockPokeapiService.fetchSpeciesDetails.mockResolvedValue(
        mockSpeciesDetails,
      );
      mockPokeapiService.fetchTypeDetails.mockResolvedValue(
        mockTypeDetailsElectric,
      );
      mockPokeapiService.fetchGenerationDetails.mockResolvedValue(
        mockGenerationDetails,
      );

      mockHttpService.get.mockReturnValue(require('rxjs').of(mockHttpResponse));
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findOne(idOrName);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchSpeciesDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchTypeDetails).toHaveBeenCalledWith(
        'type_electric_url',
      );
      expect(mockPokeapiService.fetchGenerationDetails).toHaveBeenCalledWith(
        'gen_1_url',
      );
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, expectedPokemon);

      expect(mockHttpService.get).toHaveBeenCalledWith('original_front_url', {
        responseType: 'arraybuffer',
      });
      expect(mockHttpService.get).toHaveBeenCalledWith('original_back_url', {
        responseType: 'arraybuffer',
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        frontImageCacheKey,
        mockImageBuffer,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        backImageCacheKey,
        mockImageBuffer,
      );
      expect(result).toEqual(expectedPokemon);
    });

    it('should fetch from API and handle missing optional data (back image, region)', async () => {
      const detailsWithoutOptional = {
        ...mockPokemonDetails,
        sprites: { front_default: 'original_front_url', back_default: null },
      };
      const speciesWithoutGen = { generation: null };
      const simplifiedWithoutOptional = {
        ...mockSimplifiedPokemon,
        frontImage: `${process.env.API_URL}/pokemon/pikachu/front-image`,
        backImage: null,
        region: null,
        originalImages: {
          front: 'original_front_url',
          back: null,
        },
      };

      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      mockPokeapiService.fetchPokemonDetails.mockResolvedValue(
        detailsWithoutOptional,
      );
      mockPokeapiService.fetchSpeciesDetails.mockResolvedValue(
        speciesWithoutGen,
      );
      mockPokeapiService.fetchTypeDetails.mockResolvedValue(
        mockTypeDetailsElectric,
      );

      mockHttpService.get.mockReturnValue(require('rxjs').of(mockHttpResponse));
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findOne(idOrName);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchSpeciesDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchTypeDetails).toHaveBeenCalledWith(
        'type_electric_url',
      );
      expect(mockPokeapiService.fetchGenerationDetails).not.toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        simplifiedWithoutOptional,
      );
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
      expect(mockHttpService.get).toHaveBeenCalledWith('original_front_url', {
        responseType: 'arraybuffer',
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        frontImageCacheKey,
        mockImageBuffer,
      );
      expect(cacheManager.set).not.toHaveBeenCalledWith(
        backImageCacheKey,
        expect.anything(),
      );
      expect(result).toEqual(simplifiedWithoutOptional);
    });

    it('should throw NotFoundException if PokeAPI throws NotFoundException', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      const notFoundError = new NotFoundException(
        `Pokemon ${idOrName} not found`,
      );
      mockPokeapiService.fetchPokemonDetails.mockRejectedValue(notFoundError);

      await expect(service.findOne(idOrName)).rejects.toThrow(
        NotFoundException,
      );
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should retry fetch if initial API call fails with a generic error, then succeed', async () => {
      const expectedPokemon = {
        ...mockSimplifiedPokemon,
        backImage: `${process.env.API_URL}/pokemon/pikachu/back-image`,
        frontImage: `${process.env.API_URL}/pokemon/pikachu/front-image`,
      };

      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      const genericError = new Error('Network Error');

      mockPokeapiService.fetchPokemonDetails
        .mockRejectedValueOnce(genericError)
        .mockResolvedValue(mockPokemonDetails);

      mockPokeapiService.fetchSpeciesDetails.mockResolvedValue(
        mockSpeciesDetails,
      );
      mockPokeapiService.fetchTypeDetails.mockResolvedValue(
        mockTypeDetailsElectric,
      );
      mockPokeapiService.fetchGenerationDetails.mockResolvedValue(
        mockGenerationDetails,
      );
      mockHttpService.get.mockReturnValue(require('rxjs').of(mockHttpResponse));
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findOne(idOrName);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledTimes(2);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenNthCalledWith(
        1,
        idOrName,
      );

      expect(mockPokeapiService.fetchSpeciesDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchTypeDetails).toHaveBeenCalledWith(
        'type_electric_url',
      );
      expect(mockPokeapiService.fetchGenerationDetails).toHaveBeenCalledWith(
        'gen_1_url',
      );
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, expectedPokemon);
      expect(cacheManager.set).toHaveBeenCalledWith(
        frontImageCacheKey,
        mockImageBuffer,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        backImageCacheKey,
        mockImageBuffer,
      );
      expect(result).toEqual(expectedPokemon);
    });

    it('should throw an error if initial API call and retry both fail', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      const genericError = new Error('Network Error');
      const retryError = new Error('Retry Network Error');

      mockPokeapiService.fetchPokemonDetails
        .mockRejectedValueOnce(genericError)
        .mockRejectedValueOnce(retryError);

      await expect(service.findOne(idOrName)).rejects.toThrow(
        `Could not process data for Pokemon ${idOrName}, retry failed: Error: ${retryError.message}`,
      );
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledTimes(2);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should ignore cache and fetch from API when ignoreCache option is true', async () => {
      const expectedPokemon = {
        ...mockSimplifiedPokemon,
        backImage: `${process.env.API_URL}/pokemon/pikachu/back-image`,
        frontImage: `${process.env.API_URL}/pokemon/pikachu/front-image`,
      };

      (cacheManager.get as jest.Mock).mockResolvedValue(mockSimplifiedPokemon);
      mockPokeapiService.fetchPokemonDetails.mockResolvedValue(
        mockPokemonDetails,
      );
      mockPokeapiService.fetchSpeciesDetails.mockResolvedValue(
        mockSpeciesDetails,
      );
      mockPokeapiService.fetchTypeDetails.mockResolvedValue(
        mockTypeDetailsElectric,
      );
      mockPokeapiService.fetchGenerationDetails.mockResolvedValue(
        mockGenerationDetails,
      );
      mockHttpService.get.mockReturnValue(require('rxjs').of(mockHttpResponse));
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findOne(idOrName, { ignoreCache: true });

      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(mockPokeapiService.fetchPokemonDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchSpeciesDetails).toHaveBeenCalledWith(
        idOrName,
      );
      expect(mockPokeapiService.fetchTypeDetails).toHaveBeenCalledWith(
        'type_electric_url',
      );
      expect(mockPokeapiService.fetchGenerationDetails).toHaveBeenCalledWith(
        'gen_1_url',
      );
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, expectedPokemon);
      expect(cacheManager.set).toHaveBeenCalledWith(
        frontImageCacheKey,
        mockImageBuffer,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        backImageCacheKey,
        mockImageBuffer,
      );
      expect(result).toEqual(expectedPokemon);
    });
  });

  describe('findAll', () => {
    const defaultLimit = 20;
    const defaultOffset = 0;
    const cacheKey = `allPokemonNames`;
    const mockPokemonListResponse = {
      count: 100,
      results: [{ name: 'bulbasaur' }, { name: 'ivysaur' }],
      next: 'next_url',
      previous: 'prev_url',
    };
    const mockCachedNames = Array.from(
      { length: 50 },
      (_, i) => `pokemon_${i + 1}`,
    );

    it('should ignore cache and fetch from API when ignoreCache is true', async () => {
      const limit = 10;
      const offset = 5;
      mockPokeapiService.fetchPokemonList.mockResolvedValue(
        mockPokemonListResponse,
      );

      const result = await service.findAll({
        ignoreCache: true,
        limit,
        offset,
      });

      expect(mockCacheManager.get).not.toHaveBeenCalled();
      expect(mockPokeapiService.fetchPokemonList).toHaveBeenCalledWith(
        limit,
        offset,
      );
      expect(result).toEqual({
        ...mockPokemonListResponse,
        next: String(offset + limit),
        previous: String(offset - limit >= 0 ? offset - limit : 0),
      });
    });

    it('should fetch from API if cache is empty', async () => {
      const limit = 15;
      const offset = 0;
      mockCacheManager.get.mockResolvedValue(undefined);
      mockPokeapiService.fetchPokemonList.mockResolvedValue(
        mockPokemonListResponse,
      );

      const result = await service.findAll({ limit, offset });

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonList).toHaveBeenCalledWith(
        limit,
        offset,
      );
      expect(result).toEqual({
        ...mockPokemonListResponse,
        next: String(offset + limit),
        previous: String(offset - limit >= 0 ? offset - limit : 0),
      });
    });

    it('should return sliced data from cache if found', async () => {
      const limit = 10;
      const offset = 5;
      mockCacheManager.get.mockResolvedValue(mockCachedNames);

      const result = await service.findAll({ limit, offset });

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonList).not.toHaveBeenCalled();
      expect(result.count).toBe(mockCachedNames.length);
      expect(result.results).toEqual(
        mockCachedNames.slice(offset, offset + limit).map((name) => ({ name })),
      );
      expect(result.next).toBe(String(offset + limit));
      expect(result.previous).toBe(
        String(offset - limit >= 0 ? offset - limit : 0),
      );
    });

    it('should use default limit and offset if not provided when using cache', async () => {
      mockCacheManager.get.mockResolvedValue(mockCachedNames);

      const result = await service.findAll(); // No options provided

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonList).not.toHaveBeenCalled();
      expect(result.count).toBe(mockCachedNames.length);
      expect(result.results).toEqual(
        mockCachedNames
          .slice(defaultOffset, defaultOffset + defaultLimit)
          .map((name) => ({ name })),
      );
      expect(result.next).toBe(String(defaultOffset + defaultLimit));
      expect(result.previous).toBe(
        String(
          defaultOffset - defaultLimit >= 0 ? defaultOffset - defaultLimit : 0,
        ),
      );
    });

    it('should handle offset exceeding cache size gracefully', async () => {
      const limit = 10;
      const offset = 60; // Exceeds mockCachedNames.length (50)
      mockCacheManager.get.mockResolvedValue(mockCachedNames);

      const result = await service.findAll({ limit, offset });

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonList).not.toHaveBeenCalled();
      expect(result.count).toBe(mockCachedNames.length);
      expect(result.results).toEqual([]); // Slice results in an empty array
      expect(result.next).toBe(String(offset + limit));
      expect(result.previous).toBe(
        String(offset - limit >= 0 ? offset - limit : 0),
      );
    });

    it('should handle limit exceeding remaining cache size gracefully', async () => {
      const limit = 15;
      const offset = 40; // Start near the end
      mockCacheManager.get.mockResolvedValue(mockCachedNames); // Length 50

      const result = await service.findAll({ limit, offset });

      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPokeapiService.fetchPokemonList).not.toHaveBeenCalled();
      expect(result.count).toBe(mockCachedNames.length);
      // Should return names from index 40 to 49 (10 names)
      expect(result.results).toEqual(
        mockCachedNames.slice(offset, offset + limit).map((name) => ({ name })),
      );
      expect(result.results.length).toBe(10); // Only 10 remaining items
      expect(result.next).toBe(String(offset + limit));
      expect(result.previous).toBe(
        String(offset - limit >= 0 ? offset - limit : 0),
      );
    });
  });
});
