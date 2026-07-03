/**
 * @fileoverview DTO de respuesta para la lista pública de profesionales.
 * @author Luis Manuel
 * @date 03/07/2026
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 *
 * Contiene ÚNICAMENTE los campos necesarios para renderizar la tarjeta
 * de un profesional en la UI del cliente. Ningún dato interno de la BD
 * (IDs internos, estadoVerificacion, usuarioId, documentos sensibles) viaja
 * en esta respuesta.
 */

export class ProfesionalCardResponseDto {
  /** ID público del Perfil — suficiente para navegar al detalle */
  id: string;
  nombre: string;
  fotoPerfil: string | null;
  categoriaPrincipal: string | null;
  etiquetas: string[];
  promedioCalificacion: number;
  aceptaUrgencias: boolean;
  municipio: string | null;
  estadoRep: string | null;

  constructor(data: {
    id: string;
    nombre: string;
    fotoPerfil: string | null;
    categoriaPrincipal: string | null;
    etiquetas: string[];
    promedioCalificacion: number;
    aceptaUrgencias: boolean;
    municipio: string | null;
    estadoRep: string | null;
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.fotoPerfil = data.fotoPerfil;
    this.categoriaPrincipal = data.categoriaPrincipal;
    this.etiquetas = data.etiquetas;
    this.promedioCalificacion = data.promedioCalificacion;
    this.aceptaUrgencias = data.aceptaUrgencias;
    this.municipio = data.municipio;
    this.estadoRep = data.estadoRep;
  }
}
