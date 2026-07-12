import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

/**
 * @fileoverview Middleware global para sanitizar de manera automática
 * cualquier cadena de texto entrante (body, query, params) y proteger contra ataques XSS.
 * No es necesario usar un decorador DTO porque esto corre para todo el tráfico.
 */
@Injectable()
export class XssMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (req.body) req.body = this.sanitizeObject(req.body);

    // req.query es read-only en Express moderno — se mutan las propiedades en su lugar
    if (req.query) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const sanitized = this.sanitizeObject({ ...req.query });
      Object.assign(req.query, sanitized);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (req.params) req.params = this.sanitizeObject(req.params);

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }

    if (obj !== null && typeof obj === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.keys(obj).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        obj[key] = this.sanitizeObject(obj[key]);
      });
    }

    return obj;
  }
}
