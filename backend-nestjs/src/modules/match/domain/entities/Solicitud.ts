/**
 * @fileoverview Entidad de dominio para solicitudes de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

export class Solicitud {
  constructor(
    public readonly id: string,
    public readonly clienteId: string,
    public readonly profesionalId: string,
    public readonly descripcion: string,
    public readonly estado: string,
    public readonly esUrgencia: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaActualizacion: Date,
    public readonly clienteNombre?: string,
    public readonly clienteCorreo?: string,
  ) {}
}
