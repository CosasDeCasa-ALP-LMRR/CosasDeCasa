/**
 * @fileoverview Implementación concreta de IJwtAdapter utilizando JwtService de @nestjs/jwt.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
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
}
