/**
 * @fileoverview Puerto (interfaz) para la generación y verificación de tokens JWT.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

export interface JwtPayload {
  sub: string;
  role: string;
  tokenType?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export abstract class IJwtAdapter {
  abstract sign(payload: Record<string, unknown>): string;
  abstract verify(token: string): JwtPayload;
  abstract signRefresh(payload: Record<string, unknown>): string;
  abstract verifyRefresh(token: string): JwtPayload;
}
