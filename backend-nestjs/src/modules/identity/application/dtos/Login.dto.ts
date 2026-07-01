/**
 * @fileoverview DTO para la validación de los datos de inicio de sesión.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Sanitize } from '../decorators/sanitize.decorator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @Sanitize()
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
