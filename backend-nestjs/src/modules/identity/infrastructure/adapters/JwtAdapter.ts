/**
 * @fileoverview Implementación concreta de IJwtAdapter utilizando JwtService de @nestjs/jwt.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */
/**
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se agregaron signRefresh() y verifyRefresh() para manejar refresh tokens
 *          con un secret y expiración independientes del access token.
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtAdapter, JwtPayload } from '../../domain/adapters/IJwtAdapter';

@Injectable()
export class JwtAdapter implements IJwtAdapter {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  signRefresh(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-cambiar-en-produccion',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as any,
    });
  }

  verifyRefresh(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-cambiar-en-produccion',
    });
  }
}

