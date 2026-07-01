/**
 * @fileoverview Caso de uso para obtener las solicitudes recibidas por un profesional.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import { Injectable } from '@nestjs/common';
import { ISolicitudRepository } from '../../domain/repositories/ISolicitudRepository';

@Injectable()
export class GetSolicitudesRecibidasUseCase {
  constructor(private readonly solicitudRepository: ISolicitudRepository) {}

  async execute(profesionalId: string) {
    return await this.solicitudRepository.findByProfesionalId(profesionalId);
  }
}
