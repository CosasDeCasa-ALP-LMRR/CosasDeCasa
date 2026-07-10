/**
 * @fileoverview Caso de uso para obtener profesionales aprobados (Cliente).
 * @date 27/06/2026
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se sustituyó `include` por `select` explícito en la consulta de Prisma.
 *          Los resultados se mapean a ProfesionalCardResponseDto antes de retornarlos,
 *          garantizando que ningún campo interno viaje en la respuesta HTTP.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ProfesionalCardResponseDto } from '../dtos/response/ProfesionalCard.response-dto';

@Injectable()
export class GetProfesionalesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<ProfesionalCardResponseDto[]> {
    const perfiles = await this.prisma.perfil.findMany({
      where: {
        estadoVerificacion: 'APROBADO',
      },
      // select estricto: solo columnas necesarias para las tarjetas de la UI
      select: {
        id: true,
        usuarioId: true,
        categoriaPrincipal: true,
        etiquetas: true,
        promedioCalificacion: true,
        aceptaUrgencias: true,
        municipio: true,
        estadoRep: true,
        usuario: {
          select: {
            nombre: true,
            fotoPerfil: true,
            // passwordHash, correo, activo, fechaCreacion, rol — EXCLUIDOS
          },
        },
        // documentos — EXCLUIDOS de la lista pública
      },
      orderBy: {
        promedioCalificacion: 'desc',
      },
    });

    // Mapear cada resultado al DTO tipado
    return perfiles.map(
      (p) =>
        new ProfesionalCardResponseDto({
          id: p.id,
          usuarioId: p.usuarioId,
          nombre: p.usuario.nombre,
          fotoPerfil: p.usuario.fotoPerfil ?? null,
          categoriaPrincipal: p.categoriaPrincipal,
          etiquetas: p.etiquetas,
          promedioCalificacion: p.promedioCalificacion,
          aceptaUrgencias: p.aceptaUrgencias,
          municipio: p.municipio,
          estadoRep: p.estadoRep,
        }),
    );
  }
}
