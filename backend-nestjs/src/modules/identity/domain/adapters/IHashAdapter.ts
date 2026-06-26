/**
 * @fileoverview Puerto (interfaz) para el servicio de encriptación de contraseñas.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

export abstract class IHashAdapter {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
