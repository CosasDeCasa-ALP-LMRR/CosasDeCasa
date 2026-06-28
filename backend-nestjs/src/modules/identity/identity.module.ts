/**
 * @fileoverview Módulo principal de Identidad que agrupa y expone los casos de uso, controladores y repositorios.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */
/**
 * @modified 26/06/2026
 * @author Luis Manuel
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 * @changes Se integró JwtModule con configuración desde variables de entorno.
 *          Se registraron los puertos IUsuarioRepository, IHashAdapter e IJwtAdapter
 *          con sus implementaciones concretas (Prisma, Bcrypt, JwtAdapter).
 *          Se agregaron los casos de uso RegisterUsuarioUseCase y LoginUsuarioUseCase.
 *          Se añadió AuthController con los endpoints de autenticación.
 * @modified 28/06/2026 — Se registró IRefreshTokenRepository, PrismaRefreshTokenRepository
 *          y RefreshTokenUseCase para el flujo completo de refresh token.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// --- Puertos y adaptadores de perfil (RF2 - Cesar Gonzalez) ---
import { IPerfilRepository } from './domain/repositories/IPerfilRepository';
import { IDocumentoRepository } from './domain/repositories/IDocumentoRepository';
import { IStorageAdapter } from './domain/adapters/IStorageAdapter';
import { PrismaPerfilRepository } from './infrastructure/persistence/PrismaPerfilRepository';
import { PrismaDocumentoRepository } from './infrastructure/persistence/PrismaDocumentoRepository';
import { LocalStorageAdapter } from './infrastructure/adapters/LocalStorageAdapter';
// --- Casos de uso de perfil (RF2 - Cesar Gonzalez) ---
import { GetPerfilUseCase } from './application/use-cases/GetPerfil.use-case';
import { UpdatePerfilUseCase } from './application/use-cases/UpdatePerfil.use-case';
import { AddDocumentoUseCase } from './application/use-cases/AddDocumento.use-case';
import { DeleteDocumentoUseCase } from './application/use-cases/DeleteDocumento.use-case';
import { VerifyPerfilUseCase } from './application/use-cases/VerifyPerfil.use-case';
import { CancelAccountUseCase } from './application/use-cases/CancelAccount.use-case';
import { GetPerfilesPendientesUseCase } from './application/use-cases/GetPerfilesPendientes.use-case';
import { GetProfesionalesUseCase } from './application/use-cases/GetProfesionales.use-case';
// --- Controladores de perfil (RF2 - Cesar Gonzalez) ---
import { PerfilController } from './presentation/controllers/PerfilController';
// --- Puertos y adaptadores de autenticación (RF1/RNF1 - Luis Manuel) ---
import { IUsuarioRepository } from './domain/repositories/IUsuarioRepository';
import { IHashAdapter } from './domain/adapters/IHashAdapter';
import { IJwtAdapter } from './domain/adapters/IJwtAdapter';
import { PrismaUsuarioRepository } from './infrastructure/persistence/PrismaUsuarioRepository';
import { BcryptHashAdapter } from './infrastructure/adapters/BcryptHashAdapter';
import { JwtAdapter } from './infrastructure/adapters/JwtAdapter';
// --- Casos de uso de autenticación (RF1/RNF1 - Luis Manuel) ---
import { RegisterUsuarioUseCase } from './application/use-cases/RegisterUsuario.use-case';
import { LoginUsuarioUseCase } from './application/use-cases/LoginUsuario.use-case';
import { UpdateFotoPerfilUseCase } from './application/use-cases/UpdateFotoPerfil.use-case';
import { RefreshTokenUseCase } from './application/use-cases/RefreshToken.use-case';
import { IRefreshTokenRepository } from './domain/repositories/IRefreshTokenRepository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/PrismaRefreshTokenRepository';
// --- Controlador de autenticación (RF1/RNF1 - Luis Manuel) ---
import { AuthController } from './presentation/controllers/AuthController';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'cambiar-en-produccion',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
        },
      }),
    }),
  ],
  controllers: [PerfilController, AuthController],
  providers: [
    // Perfil (RF2 - Cesar Gonzalez)
    { provide: IPerfilRepository, useClass: PrismaPerfilRepository },
    { provide: IDocumentoRepository, useClass: PrismaDocumentoRepository },
    { provide: IStorageAdapter, useClass: LocalStorageAdapter },
    GetPerfilUseCase,
    UpdatePerfilUseCase,
    AddDocumentoUseCase,
    DeleteDocumentoUseCase,
    VerifyPerfilUseCase,
    CancelAccountUseCase,
    GetPerfilesPendientesUseCase,
    GetProfesionalesUseCase,
    // Autenticación (RF1/RNF1 - Luis Manuel)
    { provide: IUsuarioRepository, useClass: PrismaUsuarioRepository },
    { provide: IHashAdapter, useClass: BcryptHashAdapter },
    { provide: IJwtAdapter, useClass: JwtAdapter },
    { provide: IRefreshTokenRepository, useClass: PrismaRefreshTokenRepository },
    RegisterUsuarioUseCase,
    LoginUsuarioUseCase,
    UpdateFotoPerfilUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    // Perfil (RF2 - Cesar Gonzalez)
    IPerfilRepository,
    IDocumentoRepository,
    IStorageAdapter,
    GetPerfilUseCase,
    CancelAccountUseCase,
    // Autenticación (RF1/RNF1 - Luis Manuel)
    IJwtAdapter,
    IRefreshTokenRepository,
  ],
})
export class IdentityModule {}
