/**
 * @fileoverview Guard de seguridad temporal para simular autenticación leyendo cabeceras HTTP.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: string; role: string } }>();
    const userId = request.headers['x-user-id'] as string | undefined;
    const userRole = request.headers['x-user-role'] as string | undefined;

    if (!userId || !userRole) {
      throw new UnauthorizedException(
        'Faltan las cabeceras de autenticación de pruebas: x-user-id o x-user-role',
      );
    }

    request.user = {
      id: userId,
      role: userRole,
    };

    return true;
  }
}
