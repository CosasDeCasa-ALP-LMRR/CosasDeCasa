/**
 * @fileoverview Caso de uso para obtener un perfil público o auto-crear el perfil del profesional autenticado.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetPerfilUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async executeById(id: string) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
            fotoPerfil: true,
          },
        },
        documentos: true,
      },
    });
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }
    return perfil;
  }

  async executeByUsuarioId(usuarioId: string) {
    let perfil = await this.prisma.perfil.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
            fotoPerfil: true,
          },
        },
        documentos: true,
      },
    });

    if (!perfil) {
      // Auto-create a default empty profile for this user
      perfil = await this.prisma.perfil.create({
        data: {
          usuarioId,
          etiquetas: [],
          aceptaUrgencias: false,
          estadoVerificacion: 'PENDIENTE',
          promedioCalificacion: 0.0,
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              correo: true,
              fotoPerfil: true,
            },
          },
          documentos: true,
        },
      });
    }
    return perfil;
  }
}
