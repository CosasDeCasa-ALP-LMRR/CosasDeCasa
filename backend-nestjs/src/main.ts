/**
 * @modified 26/06/2026
 * @author Luis Manuel
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se registró el middleware cookie-parser para que NestJS pueda leer
 *          las cookies HttpOnly donde se almacena el token JWT.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import * as express from 'express';
import { join } from 'path';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seguridad: Prevenir Clickjacking, Inyección, etc.
  app.use(helmet());
  
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Middleware para parsear cookies (requerido por RNF1 - JWT en cookies HttpOnly)
  app.use(cookieParser());

  // Serve uploads folder locally
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
