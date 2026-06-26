/**
 * @fileoverview Interfaz del repositorio para la gestión de perfiles de profesionales.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Perfil } from '../entities/Perfil';

export abstract class IPerfilRepository {
  abstract findById(id: string): Promise<Perfil | null>;
  abstract findByUsuarioId(usuarioId: string): Promise<Perfil | null>;
  abstract save(perfil: Perfil): Promise<Perfil>;
  abstract update(id: string, data: Partial<Perfil>): Promise<Perfil>;
  abstract anonymizeAccount(usuarioId: string): Promise<void>;
}
