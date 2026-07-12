/**
 * @fileoverview Caso de uso para obtener un perfil público o auto-crear el perfil del profesional autenticado.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes - executeById: usa select explícito, filtra documentos a solo PORTAFOLIO en vista pública,
 *            mapea resultado a PerfilPublicoResponseDto.
 *          - executeByUsuarioId: usa select explícito, el profesional ve todos sus documentos,
 *            mapea resultado a MiPerfilResponseDto.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  PerfilPublicoResponseDto,
  DocumentoPublicoDto,
} from '../dtos/response/PerfilPublico.response-dto';
import {
  MiPerfilResponseDto,
  MiDocumentoDto,
} from '../dtos/response/MiPerfil.response-dto';

@Injectable()
export class GetPerfilUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /** Vista pública de un perfil — solo documentos de portafolio, sin datos sensibles */
  async executeById(id: string): Promise<PerfilPublicoResponseDto> {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
      select: {
        id: true,
        biografia: true,
        categoriaPrincipal: true,
        etiquetas: true,
        municipio: true,
        estadoRep: true,
        aceptaUrgencias: true,
        promedioCalificacion: true,
        diasYHorarios: true,
        usuarioId: true, // EXCLUIDOS internal props excepto usuarioId para contacto
        usuario: {
          select: {
            nombre: true,
            fotoPerfil: true,
            // correo, passwordHash, rol, activo, fechaCreacion — EXCLUIDOS
          },
        },
        documentos: {
          // Solo tipo PORTAFOLIO es visible públicamente
          where: { tipo: 'PORTAFOLIO' },
          select: {
            id: true,
            tipo: true,
            urlArchivo: true,
            // perfilId, fechaSubida — EXCLUIDOS de la vista pública
          },
        },
      },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return new PerfilPublicoResponseDto({
      id: perfil.id,
      usuarioId: perfil.usuarioId,
      nombre: perfil.usuario.nombre,
      fotoPerfil: perfil.usuario.fotoPerfil ?? null,
      biografia: perfil.biografia,
      categoriaPrincipal: perfil.categoriaPrincipal,
      etiquetas: perfil.etiquetas,
      promedioCalificacion: perfil.promedioCalificacion,
      aceptaUrgencias: perfil.aceptaUrgencias,
      municipio: perfil.municipio,
      estadoRep: perfil.estadoRep,
      diasYHorarios: perfil.diasYHorarios,
      portafolio: perfil.documentos.map(
        (d) =>
          new DocumentoPublicoDto({
            id: d.id,
            tipo: d.tipo,
            urlArchivo: d.urlArchivo,
          }),
      ),
    });
  }

  /** Vista privada del profesional autenticado sobre su propio perfil */
  async executeByUsuarioId(usuarioId: string): Promise<MiPerfilResponseDto> {
    let perfil = await this.prisma.perfil.findUnique({
      where: { usuarioId },
      select: {
        id: true,
        telefono: true,
        biografia: true,
        categoriaPrincipal: true,
        etiquetas: true,
        codigoPostal: true,
        municipio: true,
        estadoRep: true,
        aceptaUrgencias: true,
        estadoVerificacion: true,
        promedioCalificacion: true,
        diasYHorarios: true,
        // usuarioId interno — EXCLUIDO (no lo necesita la UI, tiene el id del perfil)
        usuario: {
          select: {
            nombre: true,
            correo: true, // el profesional necesita ver su propio correo
            fotoPerfil: true,
            // passwordHash, activo, fechaCreacion, rol — EXCLUIDOS
          },
        },
        documentos: {
          // El dueño ve TODOS sus documentos (INE, CEDULA, PORTAFOLIO)
          select: {
            id: true,
            tipo: true,
            urlArchivo: true,
            fechaSubida: true,
            // perfilId — EXCLUIDO (redundante, ya conoce su perfil)
          },
        },
      },
    });

    if (!perfil) {
      // Auto-crear perfil vacío para el profesional
      perfil = await this.prisma.perfil.create({
        data: {
          usuarioId,
          etiquetas: [],
          aceptaUrgencias: false,
          estadoVerificacion: 'PENDIENTE',
          promedioCalificacion: 0.0,
        },
        select: {
          id: true,
          telefono: true,
          biografia: true,
          categoriaPrincipal: true,
          etiquetas: true,
          codigoPostal: true,
          municipio: true,
          estadoRep: true,
          aceptaUrgencias: true,
          estadoVerificacion: true,
          promedioCalificacion: true,
          diasYHorarios: true,
          usuario: {
            select: { nombre: true, correo: true, fotoPerfil: true },
          },
          documentos: {
            select: {
              id: true,
              tipo: true,
              urlArchivo: true,
              fechaSubida: true,
            },
          },
        },
      });
    }

    return new MiPerfilResponseDto({
      id: perfil.id,
      nombre: perfil.usuario.nombre,
      correo: perfil.usuario.correo,
      fotoPerfil: perfil.usuario.fotoPerfil ?? null,
      telefono: perfil.telefono,
      biografia: perfil.biografia,
      categoriaPrincipal: perfil.categoriaPrincipal,
      etiquetas: perfil.etiquetas,
      codigoPostal: perfil.codigoPostal,
      municipio: perfil.municipio,
      estadoRep: perfil.estadoRep,
      aceptaUrgencias: perfil.aceptaUrgencias,
      estadoVerificacion: perfil.estadoVerificacion,
      promedioCalificacion: perfil.promedioCalificacion,
      diasYHorarios: perfil.diasYHorarios,
      documentos: perfil.documentos.map(
        (d) =>
          new MiDocumentoDto({
            id: d.id,
            tipo: d.tipo,
            urlArchivo: d.urlArchivo,
            fechaSubida: d.fechaSubida,
          }),
      ),
    });
  }
}
