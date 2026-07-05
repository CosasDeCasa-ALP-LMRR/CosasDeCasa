/**
 * @fileoverview Caso de uso exclusivo para Auditores que permite cambiar el estado de verificación de un perfil.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { Perfil } from '../../domain/entities/Perfil';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PerfilVerificacionActualizadaEvent } from '../../domain/events/perfil-verificacion-actualizada.event';
import { IDocumentoRepository } from '../../domain/repositories/IDocumentoRepository';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';

@Injectable()
export class VerifyPerfilUseCase {
  constructor(
    private readonly perfilRepository: IPerfilRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly documentoRepository: IDocumentoRepository,
    private readonly storageAdapter: IStorageAdapter,
  ) {}

  async execute(perfilId: string, nuevoEstado: string): Promise<Perfil> {
    const perfil = await this.perfilRepository.findById(perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    const perfilActualizado = await this.perfilRepository.update(perfilId, {
      estadoVerificacion: nuevoEstado,
    });

    if (nuevoEstado === 'RECHAZADO') {
      const documentos = await this.documentoRepository.findByPerfilId(perfilId);
      for (const doc of documentos) {
        if (doc.tipo === 'INE' || doc.tipo === 'CEDULA') {
          // Primero borramos de S3 / Local
          await this.storageAdapter.deleteFile(doc.urlArchivo).catch((e) => {
             // Ignorar si el archivo no existe, pero registrarlo
             console.error(`Error deleting physical file ${doc.urlArchivo}:`, e);
          });
          // Luego borramos de la DB
          await this.documentoRepository.delete(doc.id);
        }
      }
    }

    // Emit local event implementing the Observer pattern
    this.eventEmitter.emit(
      'perfil.verificacion-actualizada',
      new PerfilVerificacionActualizadaEvent(
        perfilActualizado.id,
        perfilActualizado.usuarioId,
        perfilActualizado.estadoVerificacion,
      ),
    );

    return perfilActualizado;
  }
}
