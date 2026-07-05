/**
 * @fileoverview Caso de uso: Enviar mensaje de contacto al profesionista via WhatsApp.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros (WhatsApp Cloud API)
 *
 * Este caso de uso orquesta el envío de un mensaje inicial de contacto.
 * Depende únicamente de la interfaz IWhatsAppGateway (puerto de dominio),
 * manteniendo la lógica de negocio desacoplada de la implementación concreta de Meta/WhatsApp.
 */

import { Injectable } from '@nestjs/common';
import { IWhatsAppGateway } from '../../domain/ports/IWhatsAppGateway';

export interface SendContactMessageInput {
  /** Número de teléfono del profesionista (E.164) */
  telefonoProfesionista: string;
  /** Nombre del cliente que solicita contacto */
  nombreCliente: string;
  /** Mensaje de texto a enviar */
  mensaje: string;
}

@Injectable()
export class SendContactMessageUseCase {
  constructor(private readonly whatsAppGateway: IWhatsAppGateway) {}

  async execute(input: SendContactMessageInput): Promise<void> {
    const { telefonoProfesionista, nombreCliente, mensaje } = input;

    // Construimos el mensaje formateado con el nombre del cliente
    const mensajeFormateado = `📲 *CosasDeCasa* — Nuevo contacto\n\n*Cliente:* ${nombreCliente}\n\n*Mensaje:* ${mensaje}`;

    await this.whatsAppGateway.sendTextMessage({
      destinatario: telefonoProfesionista,
      mensaje: mensajeFormateado,
    });
  }
}
