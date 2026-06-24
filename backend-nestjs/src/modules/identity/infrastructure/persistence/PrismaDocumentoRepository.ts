/**
 * @fileoverview Implementación concreta de IDocumentoRepository utilizando Prisma ORM.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable } from '@nestjs/common';
import { IDocumentoRepository } from '../../domain/repositories/IDocumentoRepository';
import { Documento as DomainDocumento } from '../../domain/entities/Documento';
import { PrismaService } from '../../../../database/prisma.service';
import { Documento as PrismaDocumento } from '@prisma/client';

@Injectable()
export class PrismaDocumentoRepository implements IDocumentoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(prismaDoc: PrismaDocumento): DomainDocumento {
    return new DomainDocumento(
      prismaDoc.id,
      prismaDoc.perfilId,
      prismaDoc.tipo,
      prismaDoc.urlArchivo,
      prismaDoc.fechaSubida
    );
  }

  async findById(id: string): Promise<DomainDocumento | null> {
    const prismaDoc = await this.prismaService.documento.findUnique({
      where: { id },
    });

    if (!prismaDoc) return null;
    return this.mapToDomain(prismaDoc);
  }

  async findByPerfilId(perfilId: string): Promise<DomainDocumento[]> {
    const prismaDocs = await this.prismaService.documento.findMany({
      where: { perfilId },
    });

    return prismaDocs.map((d) => this.mapToDomain(d));
  }

  async save(documento: DomainDocumento): Promise<DomainDocumento> {
    const prismaDoc = await this.prismaService.documento.upsert({
      where: { id: documento.id },
      update: {
        perfilId: documento.perfilId,
        tipo: documento.tipo as any,
        urlArchivo: documento.urlArchivo,
        fechaSubida: documento.fechaSubida,
      },
      create: {
        id: documento.id,
        perfilId: documento.perfilId,
        tipo: documento.tipo as any,
        urlArchivo: documento.urlArchivo,
        fechaSubida: documento.fechaSubida,
      },
    });

    return this.mapToDomain(prismaDoc);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.documento.delete({
      where: { id },
    });
  }
}
