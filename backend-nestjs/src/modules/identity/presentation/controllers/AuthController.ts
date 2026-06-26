/**
 * @fileoverview Controlador HTTP que expone los endpoints de registro, login y logout.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegisterDto } from '../../application/dtos/Register.dto';
import { LoginDto } from '../../application/dtos/Login.dto';
import { RegisterUsuarioUseCase } from '../../application/use-cases/RegisterUsuario.use-case';
import { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuario.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUsuarioUseCase: RegisterUsuarioUseCase,
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * La contraseña se encripta antes de guardarse (nunca se almacena en texto plano).
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.registerUsuarioUseCase.execute(dto);
  }

  /**
   * Autentica al usuario y emite un JWT en una cookie HttpOnly.
   * El token NO se devuelve en el cuerpo de la respuesta.
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.loginUsuarioUseCase.execute(dto);

    // RNF1: Inyectar el JWT en una cookie con atributos de seguridad
    res.cookie('access_token', token, {
      httpOnly: true,                                          // Inaccesible desde JS del cliente
      secure: process.env.NODE_ENV === 'production',          // Solo HTTPS en producción
      sameSite: 'strict',                                     // Protección CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000,                       // Expiración: 7 días en ms
    });

    return { message: 'Inicio de sesión exitoso' };
  }

  /**
   * Cierra la sesión del usuario eliminando la cookie de autenticación.
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Sesión cerrada exitosamente' };
  }
}
