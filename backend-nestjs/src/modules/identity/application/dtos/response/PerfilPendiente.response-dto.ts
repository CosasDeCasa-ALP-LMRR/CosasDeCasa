/**
 * @fileoverview DTO de respuesta para la lista de perfiles pendientes (vista del Auditor).
 * @author Luis Manuel
 * @date 03/07/2026
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 *
 * El Auditor NECESITA ver los documentos de identidad (INE, CEDULA) para poder
 * verificar la autenticidad del profesional manualmente.
 * Sin embargo, se excluyen campos internos como passwordHash, activo, refreshTokens, etc.
 *
 * SEGURIDAD: Este DTO solo se retorna desde endpoints protegidos con @Roles('AUDITOR').
 * Las URLs de los documentos son válidas y accesibles, pero el endpoint que las expone
 * requiere autenticación, limitando el acceso a auditores autenticados.
 */

export class DocumentoAuditorDto {
  id: string;
  tipo: string; // INE | CEDULA | PORTAFOLIO
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

export class PerfilPendienteResponseDto {
  /** ID del Perfil */
  id: string;
  /** Nombre del profesional — para identificarlo en la interfaz del auditor */
  nombre: string;
  correo: string;
  fotoPerfil: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  estadoVerificacion: string;
  /** Todos los documentos (incluyendo INE/CEDULA) para revisión manual por el auditor */
  documentos: DocumentoAuditorDto[];

  constructor(data: {
    id: string;
    nombre: string;
    correo: string;
    fotoPerfil: string | null;
    biografia: string | null;
    categoriaPrincipal: string | null;
    etiquetas: string[];
    estadoVerificacion: string;
    documentos: DocumentoAuditorDto[];
  }) {
    Object.assign(this, data);
  }
}
