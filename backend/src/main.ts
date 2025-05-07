import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { isLogLevel } from './utils/isLogLevel.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: /^http:\/\/localhost:\d+$/,
  });

  const logLevel = isLogLevel(process.env.LOG_LEVEL)
    ? process.env.LOG_LEVEL
    : 'log';

  app.useLogger([logLevel]);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
