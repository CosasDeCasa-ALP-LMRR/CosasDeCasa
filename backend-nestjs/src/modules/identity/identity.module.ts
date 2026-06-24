/**
 * @fileoverview Módulo principal de Identidad que agrupa y expone los casos de uso, controladores y repositorios.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Module } from '@nestjs/common';
import { IPerfilRepository } from './domain/repositories/IPerfilRepository';
import { IDocumentoRepository } from './domain/repositories/IDocumentoRepository';
import { IStorageAdapter } from './domain/adapters/IStorageAdapter';
import { PrismaPerfilRepository } from './infrastructure/persistence/PrismaPerfilRepository';
import { PrismaDocumentoRepository } from './infrastructure/persistence/PrismaDocumentoRepository';
import { LocalStorageAdapter } from './infrastructure/adapters/LocalStorageAdapter';
import { GetPerfilUseCase } from './application/use-cases/GetPerfil.use-case';
import { UpdatePerfilUseCase } from './application/use-cases/UpdatePerfil.use-case';
import { AddDocumentoUseCase } from './application/use-cases/AddDocumento.use-case';
import { DeleteDocumentoUseCase } from './application/use-cases/DeleteDocumento.use-case';
import { VerifyPerfilUseCase } from './application/use-cases/VerifyPerfil.use-case';
import { PerfilController } from './presentation/controllers/PerfilController';

@Module({
  controllers: [PerfilController],
  providers: [
    {
      provide: IPerfilRepository,
      useClass: PrismaPerfilRepository,
    },
    {
      provide: IDocumentoRepository,
      useClass: PrismaDocumentoRepository,
    },
    {
      provide: IStorageAdapter,
      useClass: LocalStorageAdapter,
    },
    GetPerfilUseCase,
    UpdatePerfilUseCase,
    AddDocumentoUseCase,
    DeleteDocumentoUseCase,
    VerifyPerfilUseCase,
  ],
  exports: [
    IPerfilRepository,
    IDocumentoRepository,
    IStorageAdapter,
    GetPerfilUseCase,
  ],
})
export class IdentityModule {}
