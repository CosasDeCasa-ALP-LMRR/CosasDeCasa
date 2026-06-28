/**
 * @fileoverview Evento de dominio emitido cuando el estado de verificación de un perfil cambia.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

export class PerfilVerificacionActualizadaEvent {
  constructor(
    public readonly perfilId: string,
    public readonly usuarioId: string,
    public readonly nuevoEstado: string,
  ) {}
}
