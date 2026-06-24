/**
 * @fileoverview Objeto de Transferencia de Datos (DTO) para la validación al verificar un perfil.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { IsEnum, IsNotEmpty } from 'class-validator';

export enum EstadoVerificacionDto {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export class VerifyPerfilDto {
  @IsNotEmpty()
  @IsEnum(EstadoVerificacionDto)
  estado: EstadoVerificacionDto;
}
