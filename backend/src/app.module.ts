import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PokeapiService } from './pokeapi/pokeapi.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { PokemonService } from './pokemon/pokemon.service';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { PokemonController } from './pokemon/pokemon.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: () => {
        const stores = [
          new Keyv({
            store: new CacheableMemory({ ttl: 60 * 60 * 5 }),
          }),
        ];

        if (process.env.REDIS_URL) {
          stores.push(createKeyv(process.env.REDIS_URL));
        }

        return { stores };
      },
    }),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PokemonController],
  providers: [PokeapiService, TasksService, PokemonService],
})
export class AppModule {}
