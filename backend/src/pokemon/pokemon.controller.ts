import { Controller, Get, Logger, Param, Query, Res } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { Response } from 'express';

@Controller('pokemon')
export class PokemonController {
  private readonly logger = new Logger(PokemonController.name);

  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async getAllPokemon(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    this.logger.debug(
      `Fetching all Pokemon with limit: ${limit}, offset: ${offset}`,
    );

    return this.pokemonService.findAll({
      limit: Number(limit),
      offset: Number(offset),
    });
  }

  @Get(':id')
  async getPokemonById(@Param('id') id: string) {
    this.logger.debug(`Fetching Pokemon with ID: ${id}`);
    return this.pokemonService.findOne(id);
  }

  @Get(':id/front-image')
  async getPokemonFrontImage(@Param('id') id: string, @Res() res: Response) {
    this.logger.debug(`Fetching front image for Pokemon with ID: ${id}`);
    const imageBuffer = await this.pokemonService.getImage(id, 'front');

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }

  @Get(':id/back-image')
  async getPokemonBackImage(@Param('id') id: string, @Res() res: Response) {
    this.logger.debug(`Fetching back image for Pokemon with ID: ${id}`);
    const imageBuffer = await this.pokemonService.getImage(id, 'back');

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }
}
