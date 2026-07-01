/**
 * @fileoverview Objeto de Transferencia de Datos (DTO) para la validación al actualizar un perfil.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Sanitize } from '../decorators/sanitize.decorator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @Sanitize()
  telefono?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  biografia?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  categoriaPrincipal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Sanitize()
  etiquetas?: string[];

  @IsOptional()
  @IsBoolean()
  aceptaUrgencias?: boolean;

  @IsOptional()
  @IsArray()
  diasYHorarios?: any[];
}
