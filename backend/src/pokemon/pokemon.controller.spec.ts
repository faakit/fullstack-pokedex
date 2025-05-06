/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';

const mockPokemonService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getImage: jest.fn(),
};

describe('PokemonController', () => {
  let controller: PokemonController;
  let service: PokemonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    service = module.get<PokemonService>(PokemonService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPokemon', () => {
    it('should call pokemonService.findAll with default limit and offset', async () => {
      const expectedResult = { data: [], count: 0 };
      mockPokemonService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAllPokemon();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual(expectedResult);
    });

    it('should call pokemonService.findAll with provided limit and offset', async () => {
      const limit = 25;
      const offset = 5;
      const expectedResult = { data: [{ name: 'pikachu' }], count: 1 };
      mockPokemonService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAllPokemon(limit, offset);

      expect(service.findAll).toHaveBeenCalledTimes(1);

      expect(service.findAll).toHaveBeenCalledWith({
        limit: Number(limit),
        offset: Number(offset),
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle string inputs for limit and offset and convert them to numbers', async () => {
      const limit = '50';
      const offset = '10';
      const expectedResult = { data: [{ name: 'bulbasaur' }], count: 1 };
      mockPokemonService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAllPokemon(
        limit as unknown as number,
        offset as unknown as number,
      );

      expect(service.findAll).toHaveBeenCalledTimes(1);

      expect(service.findAll).toHaveBeenCalledWith({ limit: 50, offset: 10 });
      expect(result).toEqual(expectedResult);
    });

    it('should return the result from pokemonService.findAll', async () => {
      const limit = 15;
      const offset = 0;
      const mockReturn = { data: Array(15).fill({ name: 'test' }), count: 150 };
      mockPokemonService.findAll.mockResolvedValue(mockReturn);

      const result = await controller.getAllPokemon(limit, offset);

      expect(result).toBe(mockReturn);
    });
  });
});
