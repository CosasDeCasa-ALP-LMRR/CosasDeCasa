/**
 * @fileoverview Entidad de dominio que representa al usuario autenticado del sistema.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

export class Usuario {
  constructor(
    public readonly id: string,
    public nombre: string,
    public correo: string,
    public passwordHash: string,
    public rol: string,
    public activo: boolean,
    public curp?: string | null,
    public readonly fechaCreacion?: Date,
  ) {}
}
