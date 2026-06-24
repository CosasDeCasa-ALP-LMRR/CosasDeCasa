/**
 * @fileoverview Caso de uso para eliminar un documento existente del portafolio.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IDocumentoRepository } from '../../domain/repositories/IDocumentoRepository';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';
import { GetPerfilUseCase } from './GetPerfil.use-case';

@Injectable()
export class DeleteDocumentoUseCase {
  constructor(
    private readonly documentoRepository: IDocumentoRepository,
    private readonly storageAdapter: IStorageAdapter,
    private readonly getPerfilUseCase: GetPerfilUseCase
  ) {}

  async execute(usuarioId: string, documentoId: string): Promise<void> {
    const documento = await this.documentoRepository.findById(documentoId);
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado`);
    }

    const perfil = await this.getPerfilUseCase.executeByUsuarioId(usuarioId);
    if (documento.perfilId !== perfil.id) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }

    await this.storageAdapter.deleteFile(documento.urlArchivo);
    await this.documentoRepository.delete(documentoId);
  }
}
