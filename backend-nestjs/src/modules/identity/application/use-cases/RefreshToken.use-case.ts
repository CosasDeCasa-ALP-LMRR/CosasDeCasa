/**
 * @fileoverview Caso de uso para renovar el access token usando un refresh token válido.
 * @author Luis Manuel
 * @date 28/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IJwtAdapter } from '../../domain/adapters/IJwtAdapter';

export interface RefreshTokenResult {
  accessToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IJwtAdapter)
    private readonly jwtAdapter: IJwtAdapter,
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshTokenResult> {
    // 1. Hashear el token recibido para buscarlo en BD
    const tokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    // 2. Buscar el refresh token en la base de datos
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // 3. Verificar que no esté revocado ni expirado
    if (storedToken.revocado) {
      throw new UnauthorizedException(
        'Refresh token revocado. Por favor, inicia sesión nuevamente.',
      );
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException(
        'Refresh token expirado. Por favor, inicia sesión nuevamente.',
      );
    }

    // 4. Buscar el usuario asociado
    const usuario = await this.usuarioRepository.findById(
      storedToken.usuarioId,
    );

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // 5. Emitir un nuevo access token
    const accessToken = this.jwtAdapter.sign({
      sub: usuario.id,
      role: usuario.rol,
    });

    return { accessToken };
  }
}
