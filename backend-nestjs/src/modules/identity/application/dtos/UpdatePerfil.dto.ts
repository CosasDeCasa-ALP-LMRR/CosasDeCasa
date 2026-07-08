/**
 * @fileoverview Objeto de Transferencia de Datos (DTO) para la validación al actualizar un perfil.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */
/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregaron @MaxLength por campo para prevenir payloads inflados enviados
 *          directamente al BackEnd saltando las restricciones del FrontEnd (DevTools bypass).
 *          - telefono: máx 20 chars (longitud estándar E.164 con código de país)
 *          - biografia: máx 1000 chars
 *          - categoriaPrincipal: máx 100 chars
 *          - etiquetas[]: máx 50 chars por elemento
 */

import { IsString, IsOptional, IsArray, IsBoolean, MaxLength, Matches } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede superar los 20 caracteres' })
  @Matches(/^[\+]?[\d\s\-\(\)]{7,20}$/, {
    message: 'El teléfono solo puede contener dígitos, espacios, +, guiones y paréntesis (ej. +52 55 1234 5678)',
  })
  @Sanitize()
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La biografía no puede superar los 1000 caracteres' })
  @Sanitize()
  biografia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La categoría principal no puede superar los 100 caracteres' })
  @Sanitize()
  categoriaPrincipal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true, message: 'Cada etiqueta no puede superar los 50 caracteres' })
  @Sanitize()
  etiquetas?: string[];

  @IsOptional()
  @IsBoolean()
  aceptaUrgencias?: boolean;

  @IsOptional()
  @IsArray()
  diasYHorarios?: any[];
}
