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

  private readonly BATCH_SIZE =
    Number(process.env.POKEMON_CACHING_BATCH_SIZE) || 10;

  constructor(
    private readonly pokemonService: PokemonService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async handleUpdateCache() {
    if (!process.env.REDIS_URL) {
      this.logger.warn(`Redis URL not set. Skipping cache update task.`);
      return;
    }

    this.logger.log(`Updating pokemon cache...`);
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

    // Process in parallel batches to improve performance while respecting rate limits
    let pokemonCount = 0;

    for (let i = 0; i < allPokemonNames.length; i += this.BATCH_SIZE) {
      const batch = allPokemonNames.slice(i, i + this.BATCH_SIZE);

      this.logger.debug(
        `Processing batch ${i / this.BATCH_SIZE + 1}, size: ${batch.length}`,
      );

      const results = await Promise.allSettled(
        batch.map(async (name) => {
          try {
            const pokemon = await this.pokemonService.findOne(name, {
              ignoreCache: true,
            });
            const cacheKey = `pokemon:${pokemon.name}`;
            await this.cacheManager.set(cacheKey, pokemon);
            this.logger.debug(`Cached Pokemon with name: ${pokemon.name}`);
            return true;
          } catch {
            this.logger.error(
              `Error fetching Pokemon ${name} during cache update, skipping...`,
            );
            return false;
          }
        }),
      );

      pokemonCount += results.filter(
        (result) => result.status === 'fulfilled' && result.value,
      ).length;
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
