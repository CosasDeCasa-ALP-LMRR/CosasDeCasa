/**
 * @fileoverview Entidad de dominio que representa un archivo o evidencia subida por el profesional.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

export class Documento {
  constructor(
    public readonly id: string,
    public readonly perfilId: string,
    public readonly tipo: string, // 'INE', 'CEDULA', 'PORTAFOLIO'
    public readonly urlArchivo: string,
    public readonly fechaSubida: Date
  ) {}
}
