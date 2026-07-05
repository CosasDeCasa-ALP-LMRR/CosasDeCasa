/**
 * @fileoverview Puerto (interfaz) del repositorio de usuarios para el módulo de autenticación.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import { Usuario } from '../entities/Usuario';

export abstract class IUsuarioRepository {
  abstract findById(id: string): Promise<Usuario | null>;
  abstract findByCorreo(correo: string): Promise<Usuario | null>;
  abstract save(usuario: Usuario): Promise<Usuario>;
  abstract update(id: string, data: Partial<Usuario>): Promise<Usuario>;
}
