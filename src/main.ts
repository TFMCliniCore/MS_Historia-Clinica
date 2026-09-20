import { existsSync, mkdirSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 1. Importación esencial
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

  // 👈 2. Configuración estructural de Swagger para Historia Clínica
  const config = new DocumentBuilder()
    .setTitle('CliniCore - MS Historia Clínica')
    .setDescription('Endpoints para la gestión de expedientes médicos, evoluciones clínicas, recetas, antecedentes y archivos adjuntos')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🎯 El prefijo coincide exactamente con el proxy configurado en el Gateway
    SwaggerModule.setup('api/v1/historia-clinica/docs', app, document, {
    jsonDocumentUrl: 'api/v1/historia-clinica/docs-json', // 👈 Mantiene la compatibilidad con el proxy
    swaggerOptions: {
      jsonEditor: true,
    }
    });

  const port = Number(process.env.PORT ?? 3005);
  await app.listen(port, '0.0.0.0');
  console.log(`MS Historia Clínica corriendo de forma segura en puerto ${port}`);
}
void bootstrap();