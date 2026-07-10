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
    if (req.body) req.body = this.sanitizeObject(req.body);
    
    // req.query es read-only en Express moderno — se mutan las propiedades en su lugar
    if (req.query) {
      const sanitized = this.sanitizeObject({ ...req.query });
      Object.assign(req.query, sanitized);
    }

    if (req.params) req.params = this.sanitizeObject(req.params) as any;
    
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }
    
    if (obj !== null && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        obj[key] = this.sanitizeObject(obj[key]);
      });
    }
    
    return obj;
  }
}
