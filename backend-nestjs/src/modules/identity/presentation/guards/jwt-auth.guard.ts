/**
 * @fileoverview Guard de autenticación JWT que valida el token desde la cookie HttpOnly.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IJwtAdapter } from '../../domain/adapters/IJwtAdapter';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(IJwtAdapter)
    private readonly jwtAdapter: IJwtAdapter,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token: string | undefined = request.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación no encontrado. Por favor, inicia sesión.',
      );
    }

    try {
      const payload = this.jwtAdapter.verify(token);
      request.user = {
        id: payload.sub,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado. Por favor, inicia sesión nuevamente.',
      );
    }
  }
}
