/**
 * @fileoverview Puerto (interfaz) del repositorio de refresh tokens.
 * @author Luis Manuel
 * @date 28/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import { RefreshToken } from '../entities/RefreshToken';

export abstract class IRefreshTokenRepository {
  abstract save(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  abstract revokeByUsuarioId(usuarioId: string): Promise<void>;
}
