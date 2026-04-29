import { existsSync, mkdirSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  // Crea carpeta uploads si no existe
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) mkdirSync(uploadsPath, { recursive: true });

  // Sirve archivos estáticos en GET /uploads/:filename
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost));

  await app.listen(Number(process.env.PORT ?? 3005));
  console.log(`MS Historia Clínica corriendo en puerto ${process.env.PORT ?? 3005}`);
}
void bootstrap();