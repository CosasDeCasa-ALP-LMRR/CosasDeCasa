/**
 * @fileoverview Caso de uso para cambiar el estado de una solicitud y validar la propiedad del recurso.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ISolicitudRepository } from '../../domain/repositories/ISolicitudRepository';

@Injectable()
export class ChangeSolicitudEstadoUseCase {
  constructor(private readonly solicitudRepository: ISolicitudRepository) {}

  async execute(
    solicitudId: string,
    profesionalId: string,
    nuevoEstado: string,
    motivoRechazo?: string,
  ) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${solicitudId} no encontrada`,
      );
    }

    if (solicitud.profesionalId !== profesionalId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar el estado de esta solicitud',
      );
    }

    // Validate allowed transitions
    const validTransitions: Record<string, string[]> = {
      PENDIENTE: ['ACEPTADA', 'RECHAZADA'],
      ACEPTADA: ['COMPLETADA'],
    };

    const allowed = validTransitions[solicitud.estado];
    if (!allowed || !allowed.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${solicitud.estado} a ${nuevoEstado}`,
      );
    }

    return await this.solicitudRepository.updateEstado(
      solicitudId,
      nuevoEstado,
      motivoRechazo,
    );
  }
}
