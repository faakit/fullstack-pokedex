import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/pokemon (GET)', () => {
    return request(app.getHttpServer())
      .get('/pokemon')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(Array.isArray(res.body.results)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
