/**
 * @fileoverview TypeScript types for RF2 - Professional Profile Management
 * @author Frontend RF2
 * @date 27/06/2026
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se separaron los tipos según el contexto de uso:
 *   - ProfesionalCard: datos mínimos para tarjetas públicas (lista de profesionales).
 *   - PerfilPublico: detalle público de un perfil (solo portafolio, sin documentos sensibles).
 *   - MiPerfil: perfil privado del profesional autenticado (incluye todos sus documentos).
 *   - Perfil: mantenido para compatibilidad con código existente del compañero (RF2).
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

// ─── DTO: Documento sin perfilId (vista pública o propia sin campo interno) ──
export interface DocumentoPublico {
  id: string;
  tipo: string;
  urlArchivo: string;
  fechaSubida?: string;
}

// ─── DTO: Tarjeta de profesional (lista pública — datos mínimos de la UI) ────
/**
 * Coincide exactamente con ProfesionalCardResponseDto del backend.
 * Solo contiene los 9 campos necesarios para renderizar una tarjeta.
 */
export interface ProfesionalCard {
  id: string;
  nombre: string;
  fotoPerfil: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  promedioCalificacion: number;
  aceptaUrgencias: boolean;
  municipio: string | null;
  estadoRep: string | null;
}

// ─── DTO: Perfil público (detalle de un profesional — sin datos sensibles) ───
/**
 * Coincide con PerfilPublicoResponseDto del backend.
 * `portafolio` solo contiene documentos de tipo PORTAFOLIO.
 * NUNCA contiene documentos INE o CEDULA.
 */
export interface PerfilPublico {
  id: string;
  nombre: string;
  fotoPerfil: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  promedioCalificacion: number;
  aceptaUrgencias: boolean;
  municipio: string | null;
  estadoRep: string | null;
  diasYHorarios: DiaHorario[] | null;
  portafolio: DocumentoPublico[];
}

// ─── DTO: Mi perfil (profesional autenticado viendo su propio perfil) ────────
/**
 * Coincide con MiPerfilResponseDto del backend.
 * El profesional puede ver todos sus documentos propios (INE, CEDULA, PORTAFOLIO).
 */
export interface MiPerfil {
  id: string;
  nombre: string;
  correo: string;
  fotoPerfil: string | null;
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
  documentos: DocumentoPublico[];
}

// ─── Tipo legacy (RF2 — Cesar Gonzalez) — mantenido para compatibilidad ──────
/** @deprecated Usar MiPerfil para el perfil propio o PerfilPublico para la vista pública. */
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
