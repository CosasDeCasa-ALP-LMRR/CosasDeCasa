/**
 * @fileoverview Implementación concreta de IUsuarioRepository utilizando Prisma ORM.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';
import { Usuario as PrismaUsuario } from '@prisma/client';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(prismaUsuario: PrismaUsuario): Usuario {
    return new Usuario(
      prismaUsuario.id,
      prismaUsuario.nombre,
      prismaUsuario.correo,
      prismaUsuario.passwordHash,
      prismaUsuario.rol,
      prismaUsuario.activo,
      prismaUsuario.fechaCreacion,
    );
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prismaService.usuario.findUnique({
      where: { correo },
    });
    if (!prismaUsuario) return null;
    return this.mapToDomain(prismaUsuario);
  }

  async save(usuario: Usuario): Promise<Usuario> {
    const prismaUsuario = await this.prismaService.usuario.create({
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        passwordHash: usuario.passwordHash,
        rol: usuario.rol as any,
        activo: usuario.activo,
      },
    });
    return this.mapToDomain(prismaUsuario);
  }
}
