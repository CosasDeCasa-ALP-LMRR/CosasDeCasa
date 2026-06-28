/**
 * @fileoverview Caso de uso para subir y actualizar la foto de perfil del usuario.
 * @author Sistema
 * @date 27/06/2026
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class UpdateFotoPerfilUseCase {
  constructor(
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IStorageAdapter)
    private readonly storageAdapter: IStorageAdapter,
    private readonly prisma: PrismaService, // Usaremos prisma para actualizar rápido
  ) {}

  async execute(
    usuarioId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 1. Validar extensión de archivo (por seguridad extra)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('Formato de imagen no soportado. Usa JPG, PNG o WEBP.');
    }

    // 2. Generar nombre de archivo único
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `usuarios/${usuarioId}/foto_${timestamp}_${cleanFileName}`;

    // 3. Subir archivo al bucket/almacenamiento
    const urlArchivo = await this.storageAdapter.saveFile(
      fileBuffer,
      path,
      mimeType,
    );

    // 4. Actualizar el usuario con la nueva URL en Prisma
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { fotoPerfil: urlArchivo },
    });

    return urlArchivo;
  }
}
