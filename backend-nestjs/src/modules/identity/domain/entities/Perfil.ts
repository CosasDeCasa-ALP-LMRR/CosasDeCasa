/**
 * @fileoverview Entidad de dominio que representa el perfil público y la configuración de un profesional.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

export class Perfil {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public telefono: string | null,
    public biografia: string | null,
    public categoriaPrincipal: string | null,
    public etiquetas: string[],
    public codigoPostal: string | null,
    public municipio: string | null,
    public estadoRep: string | null,
    public aceptaUrgencias: boolean,
    public estadoVerificacion: string, // 'PENDIENTE', 'APROBADO', 'RECHAZADO'
    public promedioCalificacion: number,
    public diasYHorarios: any | null, // Configuración de disponibilidad
    public documentos?: any[],
  ) {}
}
