/**
 * @fileoverview DTO de respuesta para el perfil público de un profesional (detalle).
 * @author Luis Manuel
 * @date 03/07/2026
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 *
 * Incluye datos del portafolio (solo tipo PORTAFOLIO).
 * NUNCA incluye documentos de tipo INE o CEDULA — son privados y solo el Auditor
 * los ve a través de un endpoint protegido.
 */

export class DocumentoPublicoDto {
  id: string;
  tipo: string;
  urlArchivo: string;

  constructor(data: { id: string; tipo: string; urlArchivo: string }) {
    this.id = data.id;
    this.tipo = data.tipo;
    this.urlArchivo = data.urlArchivo;
  }
}

export class PerfilPublicoResponseDto {
  id: string;
  usuarioId: string;
  nombre: string;
  fotoPerfil: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  promedioCalificacion: number;
  aceptaUrgencias: boolean;
  municipio: string | null;
  estadoRep: string | null;
  diasYHorarios: unknown;
  /** Solo contiene documentos de tipo PORTAFOLIO — evidencias de trabajo visibles públicamente */
  portafolio: DocumentoPublicoDto[];

  constructor(data: {
    id: string;
    usuarioId: string;
    nombre: string;
    fotoPerfil: string | null;
    biografia: string | null;
    categoriaPrincipal: string | null;
    etiquetas: string[];
    promedioCalificacion: number;
    aceptaUrgencias: boolean;
    municipio: string | null;
    estadoRep: string | null;
    diasYHorarios: unknown;
    portafolio: DocumentoPublicoDto[];
  }) {
    Object.assign(this, data);
  }
}
