import { Injectable, Inject } from '@nestjs/common';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';

/**
 * @fileoverview Caso de uso encargado de ejercer el Derecho de Cancelación (ARCO) mediante borrado lógico y anonimización.
 * @author [Agustin Parra]
 * @date 26/06/2026
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura
 */

@Injectable()
export class CancelAccountUseCase {
    constructor(
        @Inject(IPerfilRepository)
        private readonly perfilRepository: IPerfilRepository,
    ) { }

    async execute(usuarioId: string): Promise<void> {
        await this.perfilRepository.anonymizeAccount(usuarioId);
    }
}