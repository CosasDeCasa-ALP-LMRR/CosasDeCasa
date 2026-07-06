/**
 * @fileoverview Módulo de mensajería — integración con WhatsApp Business Cloud API.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros
 */

import { Module } from '@nestjs/common';
import { IWhatsAppGateway } from './domain/ports/IWhatsAppGateway';
import { WhatsAppCloudAdapter } from './infrastructure/adapters/WhatsAppCloudAdapter';
import { SendContactMessageUseCase } from './application/use-cases/SendContactMessage.use-case';
import { MessagingController } from './presentation/controllers/MessagingController';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [MessagingController],
  providers: [
    // Inyección del adaptador concreto detrás de la interfaz de dominio
    { provide: IWhatsAppGateway, useClass: WhatsAppCloudAdapter },
    SendContactMessageUseCase,
  ],
})
export class MessagingModule {}
