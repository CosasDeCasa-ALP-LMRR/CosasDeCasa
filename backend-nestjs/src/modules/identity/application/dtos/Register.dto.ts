/**
 * @fileoverview DTO para la validación de los datos de registro de un nuevo usuario.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */
/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregaron decoradores @MaxLength en nombre, correo y password para prevenir
 *          ataques de payload inflado. Se agregó @Matches en password para reforzar la
 *          política mínima de contraseña en el backend, independientemente de cualquier
 *          validación del FrontEnd que pueda ser bypasseada desde DevTools (F12).
 */

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';
import { IsCURPMexicano } from '../../../../common/decorators/is-curp.decorator';

export enum RolRegistro {
  CLIENTE = 'CLIENTE',
  PROFESIONAL = 'PROFESIONAL',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(80, { message: 'El nombre no puede superar los 80 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message:
      'El nombre solo puede contener letras y espacios. Caracteres especiales no permitidos.',
  })
  @Sanitize()
  nombre: string;

  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @MaxLength(154, { message: 'El correo no puede superar los 154 caracteres' })
  @Sanitize()
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(30, {
    message: 'La contraseña no puede superar los 30 caracteres',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  password: string;

  @IsOptional()
  @IsEnum(RolRegistro, { message: 'El rol debe ser CLIENTE o PROFESIONAL' })
  rol?: RolRegistro;

  @IsOptional()
  @IsString()
  @IsCURPMexicano()
  @Sanitize()
  curp?: string;
}
