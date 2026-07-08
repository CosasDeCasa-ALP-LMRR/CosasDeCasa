import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * @fileoverview Filtro global que intercepta los errores 429 (Too Many Requests)
 * lanzados por el ThrottlerGuard y los enriquece con:
 *   1. Cabecera Retry-After (estándar HTTP RFC 6585) — le dice al cliente cuándo puede reintentar.
 *   2. Log de advertencia en Winston para auditoría de seguridad.
 * @requirement RNF3: Rate Limiting y Prevención de Fuerza Bruta
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Período de espera en segundos antes de reintentar
    const retryAfterSeconds = 60;

    // Log de auditoría de seguridad
    this.logger.warn(
      `[Rate Limit] IP bloqueada por exceso de peticiones. URL: ${request.originalUrl}`,
      {
        context: 'ThrottlerExceptionFilter',
        ip: request.ip,
        url: request.originalUrl,
        method: request.method,
        accion: 'RATE_LIMIT_BLOCKED',
      },
    );

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .header('Retry-After', String(retryAfterSeconds))
      .json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: `Has excedido el límite de peticiones permitidas. Por favor, espera ${retryAfterSeconds} segundos antes de intentarlo de nuevo.`,
        retryAfter: retryAfterSeconds,
      });
  }
}
