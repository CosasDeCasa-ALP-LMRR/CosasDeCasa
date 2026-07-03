/**
 * @fileoverview Caso de uso para obtener los perfiles pendientes de verificación (Auditor).
 * @date 27/06/2026
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se sustituyó `include` por `select` explícito. Los documentos (INE, CEDULA)
 *          se incluyen para que el auditor pueda verificarlos manualmente, pero se
 *          excluyen campos internos del sistema como passwordHash, activo, fechaCreacion, etc.
 *          Los resultados se mapean a PerfilPendienteResponseDto[].
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  PerfilPendienteResponseDto,
  DocumentoAuditorDto,
} from '../dtos/response/PerfilPendiente.response-dto';

@Injectable()
export class GetPerfilesPendientesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<PerfilPendienteResponseDto[]> {
    const perfiles = await this.prisma.perfil.findMany({
      where: {
        estadoVerificacion: 'PENDIENTE',
      },
      select: {
        id: true,
        biografia: true,
        categoriaPrincipal: true,
        etiquetas: true,
        estadoVerificacion: true,
        usuario: {
          select: {
            nombre: true,
            correo: true,   // El auditor necesita el correo para contactar al profesional
            fotoPerfil: true,
            // passwordHash, activo, rol, fechaCreacion — EXCLUIDOS
          },
        },
        documentos: {
          // El auditor ve TODOS los documentos (INE, CEDULA, PORTAFOLIO) para verificación
          select: {
            id: true,
            tipo: true,
            urlArchivo: true,
            fechaSubida: true,
          },
        },
        // usuarioId, codigoPostal, municipio, estadoRep — EXCLUIDOS (no relevantes para auditoría)
      },
      orderBy: {
        usuario: {
          fechaCreacion: 'asc',
        },
      },
    });

    return perfiles.map(
      (p) =>
        new PerfilPendienteResponseDto({
          id: p.id,
          nombre: p.usuario.nombre,
          correo: p.usuario.correo,
          fotoPerfil: p.usuario.fotoPerfil ?? null,
          biografia: p.biografia,
          categoriaPrincipal: p.categoriaPrincipal,
          etiquetas: p.etiquetas,
          estadoVerificacion: p.estadoVerificacion,
          documentos: p.documentos.map(
            (d) =>
              new DocumentoAuditorDto({
                id: d.id,
                tipo: d.tipo,
                urlArchivo: d.urlArchivo,
                fechaSubida: d.fechaSubida,
              }),
          ),
        }),
    );
  }
}
