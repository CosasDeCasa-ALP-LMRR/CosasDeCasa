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
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegisterDto } from '../../application/dtos/Register.dto';
import { LoginDto } from '../../application/dtos/Login.dto';
import { RegisterUsuarioUseCase } from '../../application/use-cases/RegisterUsuario.use-case';
import { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuario.use-case';
import { UpdateFotoPerfilUseCase } from '../../application/use-cases/UpdateFotoPerfil.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PrismaService } from '../../../../database/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUsuarioUseCase: RegisterUsuarioUseCase,
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
    private readonly updateFotoPerfilUseCase: UpdateFotoPerfilUseCase,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Obtiene la información del usuario autenticado basado en su JWT.
   * Útil para recuperar sesión en el frontend tras recargar la página.
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    // JwtAuthGuard pone en req.user: { id, role } (payload del JWT)
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, nombre: true, correo: true, rol: true, fotoPerfil: true },
    });
    if (!usuario) throw new Error('Usuario no encontrado');
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,   // enum: PROFESIONAL | CLIENTE | AUDITOR
      correo: usuario.correo,
      fotoPerfil: usuario.fotoPerfil,
    };
  }

  /**
   * Sube o actualiza la foto de perfil del usuario
   * POST /auth/foto-perfil
   */
  @Post('foto-perfil')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFotoPerfil(
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }
    
    const url = await this.updateFotoPerfilUseCase.execute(
      req.user.id,
      file.buffer,
      file.originalname,
      file.mimetype
    );
    
    return {
      message: 'Foto de perfil actualizada exitosamente',
      fotoPerfil: url
    };
  }

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
