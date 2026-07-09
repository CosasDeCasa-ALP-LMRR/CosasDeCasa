import axiosInstance from '../../../lib/axios';

export interface Resena {
  id: string;
  clienteId: string;
  profesionalId: string;
  calificacion: number;
  comentario: string | null;
  fechaCreacion: string;
  cliente: {
    id: string;
    nombre: string;
    fotoPerfil: string | null;
  };
}

export interface CreateResenaPayload {
  calificacion: number;
  comentario?: string;
}

export async function crearResena(
  profesionalId: string,
  payload: CreateResenaPayload,
): Promise<Resena> {
  const { data } = await axiosInstance.post<Resena>(`/search/review/${profesionalId}`, payload);
  return data;
}

export async function obtenerResenas(profesionalId: string): Promise<Resena[]> {
  const { data } = await axiosInstance.get<Resena[]>(`/search/review/${profesionalId}`);
  return data;
}
