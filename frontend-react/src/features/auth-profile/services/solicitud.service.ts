import api from '../../../lib/axios';

export interface Solicitud {
  id: string;
  clienteId: string;
  clienteNombre?: string;
  clienteCorreo?: string;
  profesionalId: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'COMPLETADA';
  esUrgencia: boolean;
  /** Teléfono del cliente para contacto vía WhatsApp (RF9/RF13) */
  telefonoCliente?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export async function getSolicitudesRecibidas(): Promise<Solicitud[]> {
  const { data } = await api.get<Solicitud[]>('/match/solicitudes/recibidas');
  return data;
}

export async function changeSolicitudEstado(
  solicitudId: string,
  estado: 'ACEPTADA' | 'RECHAZADA' | 'COMPLETADA',
  motivoRechazo?: string,
): Promise<Solicitud> {
  const payload: any = { estado };
  if (motivoRechazo) {
    payload.motivoRechazo = motivoRechazo;
  }
  const { data } = await api.patch<Solicitud>(
    `/match/solicitudes/${solicitudId}/estado`,
    payload,
  );
  return data;
}

export interface CreateSolicitudPayload {
  profesionalId: string;
  descripcion?: string;
  esUrgencia?: boolean;
  /** Número de teléfono del cliente en formato internacional */
  telefonoCliente?: string;
}

export async function createSolicitud(
  payload: CreateSolicitudPayload,
): Promise<Solicitud> {
  const { data } = await api.post<Solicitud>('/match/solicitudes', payload);
  return data;
}
