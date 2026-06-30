/**
 * @fileoverview Listener de eventos que reacciona cuando un perfil es verificado para propósitos de búsqueda.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PerfilVerificacionActualizadaEvent } from '../../../identity/domain/events/perfil-verificacion-actualizada.event';

@Injectable()
export class PerfilEventosListener {
  private readonly logger = new Logger(PerfilEventosListener.name);

  @OnEvent('perfil.verificacion-actualizada')
  handlePerfilVerificacionActualizada(
    event: PerfilVerificacionActualizadaEvent,
  ) {
    this.logger.log(
      `[OBSERVADOR - SEARCH REVIEW MODULE] Capturando evento 'perfil.verificacion-actualizada': Perfil ID ${event.perfilId} del Usuario ${event.usuarioId} cambió su estado de verificación a: ${event.nuevoEstado}`,
    );
    // Here we would run database calculations or update elasticsearch/search indices.
  }
}
