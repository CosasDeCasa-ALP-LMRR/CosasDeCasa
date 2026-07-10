/**
 * @fileoverview DTO para cambiar el estado de una solicitud de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum EstadoSolicitudDto {
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
  COMPLETADA = 'COMPLETADA',
}

export class ChangeSolicitudEstadoDto {
  @IsEnum(EstadoSolicitudDto, {
    message: 'El estado debe ser ACEPTADA, RECHAZADA o COMPLETADA',
  })
  estado: EstadoSolicitudDto;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  motivoRechazo?: string;
}
