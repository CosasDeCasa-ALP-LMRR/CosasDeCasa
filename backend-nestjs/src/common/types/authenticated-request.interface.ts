/**
 * @fileoverview Tipado del objeto `request.user` inyectado por JwtAuthGuard.
 *
 * El JwtAuthGuard decodifica el token JWT y asigna un objeto con `id` y `role`
 * a `request.user`. Esta interfaz asegura que todos los Guards y Controladores
 * que lean ese campo lo hagan de forma segura y sin `any` implícitos.
 *
 * @author César González / Luis Manuel
 * @date 10/07/2026
 * @requirement RNF1, RF1
 */

import { Request } from 'express';

/** Datos del usuario autenticado extraídos del payload JWT */
export interface AuthenticatedUser {
  id: string;
  role: string;
}

/** Request de Express extendido con el usuario autenticado */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
