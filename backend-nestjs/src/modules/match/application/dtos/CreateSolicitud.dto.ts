/**
 * @fileoverview DTO para crear una solicitud de servicio.
 * @author Copilot
 * @date 30/06/2026
 */

import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSolicitudDto {
  @IsUUID('4', { message: 'El profesionalId debe ser un UUID válido' })
  profesionalId: string;

  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(1000, { message: 'La descripción no puede superar 1000 caracteres' })
  descripcion: string;

  @IsOptional()
  @IsBoolean({ message: 'esUrgencia debe ser verdadero o falso' })
  esUrgencia?: boolean;
}
