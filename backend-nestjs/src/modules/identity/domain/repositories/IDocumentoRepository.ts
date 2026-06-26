/**
 * @fileoverview Interfaz del repositorio para la gestión de documentos y evidencias del portafolio.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Documento } from '../entities/Documento';

export abstract class IDocumentoRepository {
  abstract findById(id: string): Promise<Documento | null>;
  abstract findByPerfilId(perfilId: string): Promise<Documento[]>;
  abstract save(documento: Documento): Promise<Documento>;
  abstract delete(id: string): Promise<void>;
}
