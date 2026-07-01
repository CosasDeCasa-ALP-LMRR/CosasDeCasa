/**
 * @fileoverview Caso de uso para la autenticación de usuarios y emisión de token JWT.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */
/**
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se agregó la generación y persistencia del refresh token.
 *          El refresh token se hashea (SHA-256) antes de guardarse en BD.
 *          El caso de uso ahora retorna { accessToken, refreshToken }.
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { randomUUID } from 'crypto';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { IJwtAdapter } from '../../domain/adapters/IJwtAdapter';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { LoginDto } from '../dtos/Login.dto';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUsuarioUseCase {
  constructor(
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IHashAdapter)
    private readonly hashAdapter: IHashAdapter,
    @Inject(IJwtAdapter)
    private readonly jwtAdapter: IJwtAdapter,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const usuario = await this.usuarioRepository.findByCorreo(dto.correo);

    // Mensaje genérico para no revelar si el correo existe o no (seguridad)
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await this.hashAdapter.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el access token (corta duración, ej. 15m o según JWT_EXPIRES_IN)
    const accessToken = this.jwtAdapter.sign({
      sub: usuario.id,
      role: usuario.rol,
    });

    // Generar un refresh token opaco (bytes aleatorios) — no contiene payload legible
    const rawRefreshToken = randomBytes(64).toString('hex');

    // Hashear el refresh token antes de guardarlo en BD
    const tokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    // Calcular expiración: 30 días por defecto
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Revocar todos los refresh tokens previos del usuario (rotación de tokens)
    await this.refreshTokenRepository.revokeByUsuarioId(usuario.id);

    // Persistir el nuevo refresh token hasheado
    await this.refreshTokenRepository.save(
      new RefreshToken(randomUUID(), usuario.id, tokenHash, expiresAt),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
