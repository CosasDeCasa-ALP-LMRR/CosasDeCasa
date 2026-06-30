/**
 * @fileoverview DTO para cambiar el estado de una solicitud de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import { IsEnum } from 'class-validator';

export enum EstadoSolicitudDto {
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
}

export class ChangeSolicitudEstadoDto {
  @IsEnum(EstadoSolicitudDto, {
    message: 'El estado debe ser ACEPTADA o RECHAZADA',
  })
  estado: EstadoSolicitudDto;
}
