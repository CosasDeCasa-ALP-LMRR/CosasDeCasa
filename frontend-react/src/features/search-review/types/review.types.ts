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
