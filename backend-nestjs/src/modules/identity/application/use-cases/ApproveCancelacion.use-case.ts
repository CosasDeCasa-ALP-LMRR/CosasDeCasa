/**
 * @fileoverview Caso de uso para aprobar una solicitud de cancelación y anonimizar la cuenta.
 * @author Agustin Parra
 * @date 30/06/2026
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura #19
 */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';

@Injectable()
export class ApproveCancelacionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IPerfilRepository)
    private readonly perfilRepository: IPerfilRepository,
  ) {}

  async execute(solicitudId: string): Promise<void> {
    // 1. Buscar la solicitud
    const solicitud = await this.prisma.solicitudCancelacion.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud de cancelación no encontrada');
    }

    // 2. Marcar la solicitud como APROBADA
    await this.prisma.solicitudCancelacion.update({
      where: { id: solicitudId },
      data: { estado: 'APROBADA' },
    });

    // 3. Ejecutar la anonimización de la cuenta usando tu repositorio
    // Perfil (RF4 - Agustin Parra)
    await this.perfilRepository.anonymizeAccount(solicitud.usuarioId);

    // 4. Actualizar la situación de la cuenta a ANONIMIZADA
    await this.prisma.usuario.update({
      where: { id: solicitud.usuarioId },
      data: { situacion_cuenta: 'ANONIMIZADA' },
    });
  }
}
