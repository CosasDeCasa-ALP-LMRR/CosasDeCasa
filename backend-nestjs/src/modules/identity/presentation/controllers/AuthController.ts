/**
 * @fileoverview Controlador HTTP que expone los endpoints de registro, login y logout.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */
/**
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se actualizó el login para emitir también la cookie HttpOnly del refresh token.
 *          Se agregó el endpoint POST /auth/refresh para renovar el access token
 *          sin requerir credenciales, usando el refresh token desde su cookie.
 *          Se actualizó el logout para revocar el refresh token activo en BD
 *          y borrar ambas cookies.
 */
/**
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se eliminaron accessToken y refreshToken del cuerpo JSON de /auth/login y /auth/refresh.
 *          Los tokens YA viajan en cookies HttpOnly. Exponerlos también en el body
 *          los hace accesibles desde JavaScript, contradiciendo el modelo de seguridad.
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
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler'; // RNF3 (Agustin Parra)
import { RegisterDto } from '../../application/dtos/Register.dto';
import { LoginDto } from '../../application/dtos/Login.dto';
import { RegisterUsuarioUseCase } from '../../application/use-cases/RegisterUsuario.use-case';
import { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuario.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshToken.use-case';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { createHash } from 'crypto';
import { UpdateFotoPerfilUseCase } from '../../application/use-cases/UpdateFotoPerfil.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PrismaService } from '../../../../database/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'; // RNF3 (Agustin Parra)

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUsuarioUseCase: RegisterUsuarioUseCase,
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
    private readonly updateFotoPerfilUseCase: UpdateFotoPerfilUseCase,
    private readonly prisma: PrismaService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
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
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        fotoPerfil: true,
      },
    });
    if (!usuario) throw new Error('Usuario no encontrado');
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol, // enum: PROFESIONAL | CLIENTE | AUDITOR
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
  async uploadFotoPerfil(@Req() req: any, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('El archivo de imagen es requerido');
    }

    const url = await this.updateFotoPerfilUseCase.execute(
      req.user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return {
      message: 'Foto de perfil actualizada exitosamente',
      fotoPerfil: url,
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
  // RNF3 (Agustin Parra) — Protección contra fuerza bruta: 5 intentos por minuto por IP
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.loginUsuarioUseCase.execute(dto);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
    };

    // RNF1: Access token — corta duración (según JWT_EXPIRES_IN)
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    // RNF1: Refresh token — larga duración (30 días)
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      path: '/auth/refresh', // Solo se envía al endpoint de renovación
    });

    return {
      message: 'Inicio de sesión exitoso',
      // accessToken y refreshToken NO se incluyen en el body:
      // ya viajan en cookies HttpOnly (ver res.cookie arriba).
      // Exponerlos aquí los haría accesibles desde JavaScript (XSS risk).
    };
  }

  /**
   * Renueva el access token usando el refresh token de la cookie.
   * No requiere credenciales — solo el refresh_token cookie válido.
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken: string | undefined = (req as any).cookies?.[
      'refresh_token'
    ];
    if (!rawRefreshToken) {
      throw new UnauthorizedException(
        'Refresh token no encontrado. Por favor, inicia sesión.',
      );
    }

    const { accessToken } =
      await this.refreshTokenUseCase.execute(rawRefreshToken);

    // Emitir el nuevo access token en su cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return {
      message: 'Token renovado exitosamente',
      // accessToken NO se incluye en el body: ya viaja en cookie HttpOnly.
    };
  }

  /**
   * Cierra la sesión del usuario eliminando ambas cookies y revocando el refresh token.
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Revocar el refresh token activo en BD si existe
    const rawRefreshToken: string | undefined = (req as any).cookies?.[
      'refresh_token'
    ];
    if (rawRefreshToken) {
      const tokenHash = createHash('sha256')
        .update(rawRefreshToken)
        .digest('hex');
      const stored =
        await this.refreshTokenRepository.findByTokenHash(tokenHash);
      if (stored) {
        await this.refreshTokenRepository.revokeByUsuarioId(stored.usuarioId);
      }
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', {
      ...cookieOptions,
      path: '/auth/refresh',
    });

    return { message: 'Sesión cerrada exitosamente' };
  }
}
