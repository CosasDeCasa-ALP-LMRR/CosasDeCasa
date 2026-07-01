/**
 * @fileoverview DTO para la validación de los datos de registro de un nuevo usuario.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Sanitize } from '../decorators/sanitize.decorator';

export enum RolRegistro {
  CLIENTE = 'CLIENTE',
  PROFESIONAL = 'PROFESIONAL',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Sanitize()
  nombre: string;

  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @Sanitize()
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(RolRegistro, { message: 'El rol debe ser CLIENTE o PROFESIONAL' })
  rol?: RolRegistro;
}
