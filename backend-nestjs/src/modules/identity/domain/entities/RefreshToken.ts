/**
 * @fileoverview Entidad de dominio que representa un Refresh Token persistido.
 * @author Luis Manuel
 * @date 28/06/2026
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly tokenHash: string,   // Se guarda el hash del token, no el token en texto plano
    public readonly expiresAt: Date,
    public revocado: boolean = false,
    public readonly creadoEn?: Date,
  ) {}
}
