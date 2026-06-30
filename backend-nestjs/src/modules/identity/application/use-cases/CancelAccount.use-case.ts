import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';

/**
 * @fileoverview Caso de uso encargado de ejercer el Derecho de Cancelación (ARCO).
 * Crea la solicitud, realiza la eliminación inmediata de documentos sensibles y oculta la cuenta.
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura
 */

@Injectable()
export class CancelAccountUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(IStorageAdapter) private readonly storageAdapter: IStorageAdapter,
    ) { }

    async execute(usuarioId: string, justificacion: string): Promise<void> {
        // 1. Obtener al usuario y su perfil
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: { perfil: { include: { documentos: true } } },
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // 2. Garantía ARCO: Eliminación inmediata de archivos físicos sensibles
        if (usuario.perfil && usuario.perfil.documentos.length > 0) {
            const docsSensibles = usuario.perfil.documentos.filter(
                d => d.tipo === 'INE' || d.tipo === 'CEDULA'
            );

            for (const doc of docsSensibles) {
                try {
                    await this.storageAdapter.deleteFile(doc.urlArchivo);
                } catch (e) {
                    console.error(`Error al eliminar archivo físico ${doc.urlArchivo}`, e);
                }
            }

            // Eliminar registros de la BD
            if (docsSensibles.length > 0) {
                await this.prisma.documento.deleteMany({
                    where: { id: { in: docsSensibles.map(d => d.id) } }
                });
            }
        }

        // 3. Crear solicitud de cancelación y ocultar la cuenta
        await this.prisma.$transaction(async (tx) => {
            // Crear solicitud
            await tx.solicitudCancelacion.create({
                data: {
                    usuarioId: usuarioId,
                    justificacion: justificacion,
                    estado: 'PENDIENTE',
                }
            });

            // Cambiar situación
            await tx.usuario.update({
                where: { id: usuarioId },
                data: {
                    situacion_cuenta: 'PENDIENTE_REVISION'
                }
            });
        });
    }
}
