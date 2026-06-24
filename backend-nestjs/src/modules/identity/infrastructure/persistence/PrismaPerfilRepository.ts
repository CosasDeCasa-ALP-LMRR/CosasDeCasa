/**
 * @fileoverview Implementación concreta de IPerfilRepository utilizando Prisma ORM.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable } from '@nestjs/common';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { Perfil as DomainPerfil } from '../../domain/entities/Perfil';
import { PrismaService } from '../../../../database/prisma.service';
import { Perfil as PrismaPerfil, Documento as PrismaDocumento } from '@prisma/client';

@Injectable()
export class PrismaPerfilRepository implements IPerfilRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(
    prismaPerfil: PrismaPerfil & { documentos?: PrismaDocumento[] }
  ): DomainPerfil {
    return new DomainPerfil(
      prismaPerfil.id,
      prismaPerfil.usuarioId,
      prismaPerfil.telefono,
      prismaPerfil.biografia,
      prismaPerfil.categoriaPrincipal,
      prismaPerfil.etiquetas,
      prismaPerfil.codigoPostal,
      prismaPerfil.municipio,
      prismaPerfil.estadoRep,
      prismaPerfil.aceptaUrgencias,
      prismaPerfil.estadoVerificacion,
      prismaPerfil.promedioCalificacion,
      prismaPerfil.diasYHorarios,
      prismaPerfil.documentos
        ? prismaPerfil.documentos.map((d) => ({
            id: d.id,
            perfilId: d.perfilId,
            tipo: d.tipo,
            urlArchivo: d.urlArchivo,
            fechaSubida: d.fechaSubida,
          }))
        : []
    );
  }

  async findById(id: string): Promise<DomainPerfil | null> {
    const prismaPerfil = await this.prismaService.perfil.findUnique({
      where: { id },
      include: { documentos: true },
    });

    if (!prismaPerfil) return null;
    return this.mapToDomain(prismaPerfil);
  }

  async findByUsuarioId(usuarioId: string): Promise<DomainPerfil | null> {
    const prismaPerfil = await this.prismaService.perfil.findUnique({
      where: { usuarioId },
      include: { documentos: true },
    });

    if (!prismaPerfil) return null;
    return this.mapToDomain(prismaPerfil);
  }

  async save(perfil: DomainPerfil): Promise<DomainPerfil> {
    const prismaPerfil = await this.prismaService.perfil.upsert({
      where: { usuarioId: perfil.usuarioId },
      update: {
        telefono: perfil.telefono,
        biografia: perfil.biografia,
        categoriaPrincipal: perfil.categoriaPrincipal,
        etiquetas: perfil.etiquetas,
        codigoPostal: perfil.codigoPostal,
        municipio: perfil.municipio,
        estadoRep: perfil.estadoRep,
        aceptaUrgencias: perfil.aceptaUrgencias,
        estadoVerificacion: perfil.estadoVerificacion as any,
        promedioCalificacion: perfil.promedioCalificacion,
        diasYHorarios: perfil.diasYHorarios || undefined,
      },
      create: {
        id: perfil.id,
        usuarioId: perfil.usuarioId,
        telefono: perfil.telefono,
        biografia: perfil.biografia,
        categoriaPrincipal: perfil.categoriaPrincipal,
        etiquetas: perfil.etiquetas,
        codigoPostal: perfil.codigoPostal,
        municipio: perfil.municipio,
        estadoRep: perfil.estadoRep,
        aceptaUrgencias: perfil.aceptaUrgencias,
        estadoVerificacion: perfil.estadoVerificacion as any,
        promedioCalificacion: perfil.promedioCalificacion,
        diasYHorarios: perfil.diasYHorarios || undefined,
      },
      include: { documentos: true },
    });

    return this.mapToDomain(prismaPerfil);
  }

  async update(id: string, data: Partial<DomainPerfil>): Promise<DomainPerfil> {
    const updateData: any = {};
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.biografia !== undefined) updateData.biografia = data.biografia;
    if (data.categoriaPrincipal !== undefined)
      updateData.categoriaPrincipal = data.categoriaPrincipal;
    if (data.etiquetas !== undefined) updateData.etiquetas = data.etiquetas;
    if (data.codigoPostal !== undefined) updateData.codigoPostal = data.codigoPostal;
    if (data.municipio !== undefined) updateData.municipio = data.municipio;
    if (data.estadoRep !== undefined) updateData.estadoRep = data.estadoRep;
    if (data.aceptaUrgencias !== undefined) updateData.aceptaUrgencias = data.aceptaUrgencias;
    if (data.estadoVerificacion !== undefined)
      updateData.estadoVerificacion = data.estadoVerificacion as any;
    if (data.promedioCalificacion !== undefined)
      updateData.promedioCalificacion = data.promedioCalificacion;
    if (data.diasYHorarios !== undefined) updateData.diasYHorarios = data.diasYHorarios;

    const prismaPerfil = await this.prismaService.perfil.update({
      where: { id },
      data: updateData,
      include: { documentos: true },
    });

    return this.mapToDomain(prismaPerfil);
  }
}
