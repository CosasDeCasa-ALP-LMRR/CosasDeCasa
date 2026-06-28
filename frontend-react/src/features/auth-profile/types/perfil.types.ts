/**
 * @fileoverview TypeScript types for RF2 - Professional Profile Management
 * @author Frontend RF2
 * @date 27/06/2026
 */

export type EstadoVerificacion = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface Documento {
  id: string;
  perfilId: string;
  tipo: string;
  urlArchivo: string;
  fechaSubida: string;
}

export interface Perfil {
  id: string;
  usuarioId: string;
  telefono: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  codigoPostal: string | null;
  municipio: string | null;
  estadoRep: string | null;
  aceptaUrgencias: boolean;
  estadoVerificacion: EstadoVerificacion;
  promedioCalificacion: number;
  diasYHorarios: DiaHorario[] | null;
  documentos?: Documento[];
}

export interface UpdatePerfilPayload {
  telefono?: string;
  biografia?: string;
  categoriaPrincipal?: string;
  etiquetas?: string[];
  aceptaUrgencias?: boolean;
  diasYHorarios?: DiaHorario[];
}

export const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const CATEGORIAS_PRINCIPALES = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Pintura',
  'Jardinería',
  'Limpieza',
  'Albañilería',
  'Herrería',
  'Climatización / HVAC',
  'Mudanzas',
  'Fumigación',
  'Instalaciones',
  'Remodelación',
  'Otro',
];

export const TIPOS_DOCUMENTO = [
  { value: 'INE', label: 'Identificación Oficial (INE/IFE)' },
  { value: 'CEDULA', label: 'Cédula Profesional' },
  { value: 'PORTAFOLIO', label: 'Evidencia de Portafolio' },
];
