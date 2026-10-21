import 'reflect-metadata';
import multipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { loadEnv } from './db/load-env';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  await app.register(multipart as never, {
    limits: { fileSize: Number(process.env.STORAGE_MAX_BYTES ?? 15 * 1024 * 1024) },
  });
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Forwarded-Host'],
  });
  const port = Number(process.env.PORT ?? 3100);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
