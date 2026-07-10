/**
 * @fileoverview DTO para la validación de los datos de inicio de sesión.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */
/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregaron @MaxLength en correo y password para rechazar payloads
 *          inflados incluso si el FrontEnd es bypasseado desde las DevTools del navegador.
 */

import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @MaxLength(154, { message: 'El correo no puede superar los 154 caracteres' })
  @Sanitize()
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MaxLength(30, { message: 'La contraseña no puede superar los 30 caracteres' })
  password: string;
}
