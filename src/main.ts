import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { loadEnv } from './db/load-env';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Forwarded-Host'],
  });
  const port = Number(process.env.PORT ?? 3100);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
