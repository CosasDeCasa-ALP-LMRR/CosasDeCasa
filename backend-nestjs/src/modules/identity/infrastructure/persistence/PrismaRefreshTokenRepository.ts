/**
 * @fileoverview Implementación concreta de IRefreshTokenRepository utilizando Prisma ORM.
 * @author Luis Manuel
 * @date 28/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { RefreshToken as PrismaRefreshToken } from '@prisma/client';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(rt: PrismaRefreshToken): RefreshToken {
    return new RefreshToken(
      rt.id,
      rt.usuarioId,
      rt.tokenHash,
      rt.expiresAt,
      rt.revocado,
      rt.creadoEn,
    );
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.prismaService.refreshToken.create({
      data: {
        id: refreshToken.id,
        usuarioId: refreshToken.usuarioId,
        tokenHash: refreshToken.tokenHash,
        expiresAt: refreshToken.expiresAt,
        revocado: refreshToken.revocado,
      },
    });
    return this.mapToDomain(created);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const rt = await this.prismaService.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!rt) return null;
    return this.mapToDomain(rt);
  }

  async revokeByUsuarioId(usuarioId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { usuarioId, revocado: false },
      data: { revocado: true },
    });
  }
}
