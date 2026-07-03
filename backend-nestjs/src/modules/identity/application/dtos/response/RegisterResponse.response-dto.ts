/**
 * @fileoverview DTO de respuesta para el registro de un nuevo usuario.
 * @author Luis Manuel
 * @date 03/07/2026
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 *
 * Expone únicamente los datos mínimos que el cliente necesita para confirmar
 * que su cuenta fue creada exitosamente. No incluye activo, fechaCreacion,
 * fechaActualizacion, passwordHash ni ningún campo interno.
 */

export class RegisterResponseDto {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  message: string;

  constructor(data: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.correo = data.correo;
    this.rol = data.rol;
    this.message = 'Cuenta creada exitosamente';
  }
}
