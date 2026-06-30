import api from '../../../lib/axios';

export interface Solicitud {
  id: string;
  clienteId: string;
  clienteNombre?: string;
  clienteCorreo?: string;
  profesionalId: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  esUrgencia: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export async function getSolicitudesRecibidas(): Promise<Solicitud[]> {
  const { data } = await api.get<Solicitud[]>('/match/solicitudes/recibidas');
  return data;
}

export async function changeSolicitudEstado(
  solicitudId: string,
  estado: 'ACEPTADA' | 'RECHAZADA',
): Promise<Solicitud> {
  const { data } = await api.patch<Solicitud>(
    `/match/solicitudes/${solicitudId}/estado`,
    { estado },
  );
  return data;
}

export interface CreateSolicitudPayload {
  profesionalId: string;
  descripcion?: string;
  esUrgencia?: boolean;
}

export async function createSolicitud(
  payload: CreateSolicitudPayload,
): Promise<Solicitud> {
  const { data } = await api.post<Solicitud>('/match/solicitudes', payload);
  return data;
}
