/**
 * @fileoverview Implementación concreta de ISolicitudRepository utilizando Prisma ORM.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ISolicitudRepository } from '../../domain/repositories/ISolicitudRepository';
import { Solicitud as DomainSolicitud } from '../../domain/entities/Solicitud';
import { Solicitud as PrismaSolicitud } from '@prisma/client';

@Injectable()
export class PrismaSolicitudRepository implements ISolicitudRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(
    prismaSolicitud: PrismaSolicitud & {
      cliente?: {
        nombre: string;
        correo: string;
      };
    },
  ): DomainSolicitud {
    return new DomainSolicitud(
      prismaSolicitud.id,
      prismaSolicitud.clienteId,
      prismaSolicitud.profesionalId,
      prismaSolicitud.descripcion,
      prismaSolicitud.estado,
      prismaSolicitud.esUrgencia,
      prismaSolicitud.fechaCreacion,
      prismaSolicitud.fechaActualizacion,
      prismaSolicitud.cliente?.nombre,
      prismaSolicitud.cliente?.correo,
      prismaSolicitud.telefonoCliente ?? undefined,
    );
  }

  async findById(id: string): Promise<DomainSolicitud | null> {
    const prismaSolicitud = await this.prismaService.solicitud.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            nombre: true,
            correo: true,
          },
        },
      },
    });
    if (!prismaSolicitud) return null;
    return this.mapToDomain(prismaSolicitud);
  }

  async create(data: {
    clienteId: string;
    profesionalId: string;
    descripcion: string;
    esUrgencia: boolean;
    telefonoCliente?: string;
  }): Promise<DomainSolicitud> {
    const prismaSolicitud = await this.prismaService.solicitud.create({
      data: {
        clienteId: data.clienteId,
        profesionalId: data.profesionalId,
        descripcion: data.descripcion,
        esUrgencia: data.esUrgencia,
        estado: 'PENDIENTE',
        telefonoCliente: data.telefonoCliente ?? null,
      },
    });
    return this.mapToDomain(prismaSolicitud);
  }

  async findByProfesionalId(profesionalId: string): Promise<DomainSolicitud[]> {
    const solicitudes = await this.prismaService.solicitud.findMany({
      where: { profesionalId },
      orderBy: { fechaCreacion: 'desc' },
      include: {
        cliente: {
          select: {
            nombre: true,
            correo: true,
          },
        },
      },
    });
    return solicitudes.map((solicitud) => this.mapToDomain(solicitud));
  }

  async updateEstado(id: string, estado: string, motivoRechazo?: string): Promise<DomainSolicitud> {
    const dataToUpdate: any = { estado: estado as any };
    if (motivoRechazo) {
      dataToUpdate.motivoRechazo = motivoRechazo;
    }
    const prismaSolicitud = await this.prismaService.solicitud.update({
      where: { id },
      data: dataToUpdate,
      include: {
        cliente: {
          select: {
            nombre: true,
            correo: true,
          },
        },
      },
    });
    return this.mapToDomain(prismaSolicitud);
  }
}
