import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for localhost origins
  app.enableCors({
    origin: /^http:\/\/localhost:\d+$/,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
