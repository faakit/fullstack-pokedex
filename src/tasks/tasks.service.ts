import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PokemonService } from '../pokemon/pokemon.service';
import { Cache } from 'cache-manager';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly pokemonService: PokemonService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async handleUpdateCache() {
    this.logger.debug(`Updating pokemon cache...`);
    const { count } = await this.pokemonService.findAll({
      ignoreCache: true,
      limit: 1,
    });

    if (!count) {
      this.logger.warn(`No Pokemon found to cache.`);
      return;
    }

    const allPokemonNames = (
      await this.pokemonService.findAll({ ignoreCache: true, limit: count })
    ).results.map((pokemon) => pokemon.name);

    await this.cacheManager.set('allPokemonNames', allPokemonNames);

    this.logger.debug(`Total Pokemon count: ${count}`);

    // Do one by one to avoid hitting the rate limit
    let pokemonCount = 0;
    for (const name of allPokemonNames) {
      try {
        const pokemon = await this.pokemonService.findOne(name, {
          ignoreCache: true,
        });
        const cacheKey = `pokemon:${pokemon.name}`;
        await this.cacheManager.set(cacheKey, pokemon);
        this.logger.debug(`Cached Pokemon with name: ${pokemon.name}`);
        pokemonCount++;
      } catch {
        this.logger.error(
          `Error fetching Pokemon ${name} during cache update, skipping...`,
        );
      }
    }

    this.logger.log(
      `Cache updated successfully with ${pokemonCount} out of ${count} Pokemon`,
    );
  }

  onApplicationBootstrap() {
    this.handleUpdateCache().catch((error: Error) => {
      this.logger.error(
        `Error during cache update on application bootstrap: ${error.message}`,
        error.stack,
      );
    });
  }
}
