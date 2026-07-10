/**
 * @fileoverview Caso de uso para crear una solicitud de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ISolicitudRepository } from '../../domain/repositories/ISolicitudRepository';
import { IUsuarioRepository } from '../../../identity/domain/repositories/IUsuarioRepository';

@Injectable()
export class CreateSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: ISolicitudRepository,
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(
    clienteId: string,
    profesionalId: string,
    descripcion: string,
    esUrgencia: boolean,
    telefonoCliente?: string,
  ) {
    const profesional = await this.usuarioRepository.findById(profesionalId);
    if (!profesional || profesional.rol !== 'PROFESIONAL') {
      throw new NotFoundException('Profesional no encontrado');
    }

    if (clienteId === profesionalId) {
      throw new ForbiddenException(
        'No puedes enviarte una solicitud a ti mismo',
      );
    }

    return await this.solicitudRepository.create({
      clienteId,
      profesionalId,
      descripcion,
      esUrgencia,
      telefonoCliente,
    });
  }
}
