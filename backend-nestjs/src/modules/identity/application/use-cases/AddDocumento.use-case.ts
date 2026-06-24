/**
 * @fileoverview Caso de uso para subir y registrar un nuevo documento o foto al portafolio.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { IDocumentoRepository } from '../../domain/repositories/IDocumentoRepository';
import { Documento } from '../../domain/entities/Documento';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';
import { GetPerfilUseCase } from './GetPerfil.use-case';
import { randomUUID } from 'crypto';

@Injectable()
export class AddDocumentoUseCase {
  constructor(
    private readonly documentoRepository: IDocumentoRepository,
    private readonly storageAdapter: IStorageAdapter,
    private readonly getPerfilUseCase: GetPerfilUseCase
  ) {}

  async execute(
    usuarioId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    tipo: string
  ): Promise<Documento> {
    const validTipos = ['INE', 'CEDULA', 'PORTAFOLIO'];
    if (!validTipos.includes(tipo)) {
      throw new BadRequestException(
        `Tipo de documento inválido: ${tipo}. Debe ser uno de ${validTipos.join(', ')}`
      );
    }

    const perfil = await this.getPerfilUseCase.executeByUsuarioId(usuarioId);

    const urlArchivo = await this.storageAdapter.saveFile(fileBuffer, fileName, mimeType);

    const documento = new Documento(randomUUID(), perfil.id, tipo, urlArchivo, new Date());

    return await this.documentoRepository.save(documento);
  }
}
