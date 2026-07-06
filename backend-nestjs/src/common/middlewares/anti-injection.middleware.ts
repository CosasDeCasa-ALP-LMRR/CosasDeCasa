import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * @fileoverview Middleware global para prevenir inyecciones SQL y NoSQL.
 * @requirement RNF9: Prevención de Inyecciones
 * 
 * Este middleware escanea los payloads entrantes en busca de firmas
 * peligrosas comúnmente usadas en ataques de inyección de bases de datos.
 */
@Injectable()
export class AntiInjectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AntiInjectionMiddleware.name);

  // Expresiones regulares que detectan firmas peligrosas de inyección SQL y NoSQL
  private readonly sqlInjectionPattern = /(--|;|\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|OR 1=1)\b)/i;
  private readonly noSqlInjectionPattern = /(\$where|\$ne|\$gt|\$lt|\$regex|\$in|\$nin|\$or|\$and)/i;

  use(req: Request, res: Response, next: NextFunction) {
    if (this.containsInjection(req.body) || 
        this.containsInjection(req.query) || 
        this.containsInjection(req.params)) {
      
      this.logger.warn(`Intento de inyección bloqueado desde la IP: ${req.ip}. URL: ${req.originalUrl}`);
      throw new BadRequestException('El contenido de la petición contiene caracteres o patrones no permitidos por seguridad.');
    }
    
    next();
  }

  /**
   * Recorre recursivamente los objetos para validar strings.
   */
  private containsInjection(obj: any): boolean {
    if (!obj) return false;

    if (typeof obj === 'string') {
      return this.sqlInjectionPattern.test(obj) || this.noSqlInjectionPattern.test(obj);
    }

    if (typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Evaluar las claves (útil para inyección NoSQL)
          if (this.noSqlInjectionPattern.test(key)) {
            return true;
          }
          // Evaluar los valores
          if (this.containsInjection(obj[key])) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
