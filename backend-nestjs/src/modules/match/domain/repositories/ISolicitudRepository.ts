/**
 * @fileoverview Interfaz de repositorio para gestionar solicitudes de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import { Solicitud } from '../entities/Solicitud';

export abstract class ISolicitudRepository {
  abstract findById(id: string): Promise<Solicitud | null>;
  abstract findByProfesionalId(profesionalId: string): Promise<Solicitud[]>;
  abstract create(data: {
    clienteId: string;
    profesionalId: string;
    descripcion: string;
    esUrgencia: boolean;
  }): Promise<Solicitud>;
  abstract updateEstado(id: string, estado: string): Promise<Solicitud>;
}
