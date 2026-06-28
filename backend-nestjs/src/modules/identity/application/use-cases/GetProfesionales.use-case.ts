/**
 * @fileoverview Caso de uso para obtener profesionales aprobados (Cliente).
 * @date 27/06/2026
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetProfesionalesUseCase {
  constructor(private prisma: PrismaService) { }

  async execute() {
    return await this.prisma.perfil.findMany({
      where: {
        estadoVerificacion: 'APROBADO',
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
            fotoPerfil: true,
          }
        },
        documentos: true,
      },
      orderBy: {
        promedioCalificacion: 'desc'
      }
    });
  }
}
