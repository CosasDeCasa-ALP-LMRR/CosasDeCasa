/**
 * @fileoverview DTO para crear una solicitud de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSolicitudDto {
  @IsUUID('4', { message: 'El profesionalId debe ser un UUID válido' })
  profesionalId: string;

  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(1000, {
    message: 'La descripción no puede superar 1000 caracteres',
  })
  descripcion: string;

  @IsOptional()
  @IsBoolean({ message: 'esUrgencia debe ser verdadero o falso' })
  esUrgencia?: boolean;

  /**
   * Teléfono del cliente en formato E.164 (RF9/RF13).
   * Opcional para no romper solicitudes existentes, pero recomendado
   * para habilitar el contacto rápido por WhatsApp.
   */
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'El teléfono debe ser un número válido en formato internacional (ej. +524151234567)',
  })
  telefonoCliente?: string;
}
