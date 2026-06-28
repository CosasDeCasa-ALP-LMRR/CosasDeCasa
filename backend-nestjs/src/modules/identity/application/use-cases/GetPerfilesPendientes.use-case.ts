/**
 * @fileoverview Caso de uso para obtener los perfiles pendientes de verificación (Auditor).
 * @date 27/06/2026
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetPerfilesPendientesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute() {
    return await this.prisma.perfil.findMany({
      where: {
        estadoVerificacion: 'PENDIENTE',
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
          },
        },
        documentos: true,
      },
      orderBy: {
        usuario: {
          fechaCreacion: 'asc',
        },
      },
    });
  }
}
