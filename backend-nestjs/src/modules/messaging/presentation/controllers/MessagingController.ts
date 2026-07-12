/**
 * @fileoverview Controlador HTTP para el módulo de mensajería via WhatsApp.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros (WhatsApp Cloud API)
 *
 * SEGURIDAD:
 *  - El endpoint está protegido por JwtAuthGuard: solo usuarios autenticados
 *    pueden iniciar un envío de mensaje, garantizando el consentimiento explícito
 *    del usuario autenticado antes de cualquier transferencia de datos a Meta.
 *  - No se exponen las credenciales de WhatsApp en ninguna respuesta HTTP.
 */

import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string; role?: string; nombre?: string };
}
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { SendContactMessageUseCase } from '../../application/use-cases/SendContactMessage.use-case';
import { ContactarProfesionalDto } from '../dtos/ContactarProfesional.dto';

@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly sendContactMessageUseCase: SendContactMessageUseCase,
  ) {}

  /**
   * POST /messaging/contactar
   *
   * Permite a un usuario autenticado enviar un mensaje de contacto
   * a un profesionista vía WhatsApp. El consentimiento del usuario
   * está garantizado por el hecho de estar autenticado (JWT) y ejecutar
   * deliberadamente esta acción desde la interfaz.
   *
   * @requires JwtAuthGuard — Solo usuarios autenticados pueden disparar transferencias
   */
  @Post('contactar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async contactarProfesional(
    @Body() dto: ContactarProfesionalDto,
    @Req() req: RequestWithUser,
  ) {
    const nombreCliente: string = req.user?.nombre ?? 'Un cliente';

    await this.sendContactMessageUseCase.execute({
      telefonoProfesionista: dto.telefono,
      nombreCliente,
      mensaje: dto.mensaje,
    });

    return {
      message: 'Mensaje enviado exitosamente al profesionista.',
    };
  }
}
