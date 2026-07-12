/**
 * @modified 26/06/2026
 * @author Luis Manuel
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se registró el middleware cookie-parser para que NestJS pueda leer
 *          las cookies HttpOnly donde se almacena el token JWT.
 */
/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregó `forbidNonWhitelisted: true` al ValidationPipe global.
 *          Esto hace que cualquier campo no declarado en un DTO sea rechazado
 *          con un 400 Bad Request, en lugar de ser silenciosamente ignorado.
 *          Previene ataques donde el atacante envía campos extra saltando el FrontEnd.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { getHttpsOptions } from './config/https.config';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import helmet from 'helmet';

async function bootstrap() {
  const httpsOptions = await getHttpsOptions();
  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({
    origin: [
      'https://cosasdecasa.vercel.app', // Frontend en Vercel (producción)
      'https://localhost:5173', // Frontend local (desarrollo con HTTPS)
      'http://localhost:5173', // Frontend local (desarrollo sin HTTPS)
    ],
    credentials: true, // Requerido para enviar cookies HttpOnly (JWT)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Seguridad: Prevenir Clickjacking, Inyección, aislar orígenes y forzar tipos
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      xContentTypeOptions: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
      frameguard: { action: 'deny' },
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Rechaza campos no declarados en el DTO (bypass del FE)
      transform: true,
    }),
  );

  // RNF3: Filtro global de Rate Limiting — añade Retry-After y registra IPs bloqueadas en Winston
  app.useGlobalFilters(new ThrottlerExceptionFilter(app.get('winston')));

  // Middleware para parsear cookies (requerido por RNF1 - JWT en cookies HttpOnly)
  app.use(cookieParser());

  // Serve uploads folder locally
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
