import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';

@Injectable()
export class DataLifecycleCronService {
  private readonly logger = new Logger(DataLifecycleCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageAdapter: IStorageAdapter,
  ) {}

  // Run at 3:00 AM every day
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanAbandonedProfiles() {
    this.logger.log('Iniciando limpieza automática de datos (Minimización)...');

    // Find documents uploaded more than 30 days ago that belong to a profile with PENDIENTE status
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const perfilesAbandonados = await this.prisma.perfil.findMany({
        where: {
          estadoVerificacion: 'PENDIENTE',
          // Assuming documents were uploaded long ago
          documentos: {
            some: {
              fechaSubida: {
                lt: thirtyDaysAgo,
              },
            },
          },
        },
        include: { documentos: true },
      });

      let countDeletedFiles = 0;

      for (const perfil of perfilesAbandonados) {
        for (const doc of perfil.documentos) {
          if (
            (doc.tipo === 'INE' || doc.tipo === 'CEDULA') &&
            doc.fechaSubida < thirtyDaysAgo
          ) {
            // Delete from storage
            await this.storageAdapter
              .deleteFile(doc.urlArchivo)
              .catch((e: Error) => {
                this.logger.error(
                  `Error deleting physical file ${doc.urlArchivo}: ${e.message}`,
                );
              });

            // Delete from DB
            await this.prisma.documento.delete({ where: { id: doc.id } });
            countDeletedFiles++;
          }
        }
      }

      this.logger.log(
        `Proceso automático completado. Archivos confidenciales eliminados: ${countDeletedFiles}`,
      );
    } catch (error) {
      this.logger.error(
        'Error durante la limpieza automática de datos:',
        error,
      );
    }
  }
}
