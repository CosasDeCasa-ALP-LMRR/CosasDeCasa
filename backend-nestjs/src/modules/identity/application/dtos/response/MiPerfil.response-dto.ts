/**
 * @fileoverview DTO de respuesta para el perfil propio del profesional autenticado.
 * @author Luis Manuel
 * @date 03/07/2026
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 *
 * El profesional dueño del perfil puede ver TODOS sus documentos (INE, CEDULA, PORTAFOLIO)
 * pero no se exponen campos internos como passwordHash, activo, fechaCreacion, etc.
 */

export class MiDocumentoDto {
  id: string;
  tipo: string;
  urlArchivo: string;
  fechaSubida: Date;

  constructor(data: {
    id: string;
    tipo: string;
    urlArchivo: string;
    fechaSubida: Date;
  }) {
    Object.assign(this, data);
  }
}

export class MiPerfilResponseDto {
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
  estadoVerificacion: string; // El profesional puede ver su propio estado
  promedioCalificacion: number;
  diasYHorarios: unknown;
  documentos: MiDocumentoDto[];

  constructor(data: {
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
    estadoVerificacion: string;
    promedioCalificacion: number;
    diasYHorarios: unknown;
    documentos: MiDocumentoDto[];
  }) {
    Object.assign(this, data);
  }
}
