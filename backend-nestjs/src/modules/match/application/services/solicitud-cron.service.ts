/**
 * @fileoverview Cron job para eliminar solicitudes rechazadas periódicamente.
 * @author Luis Manuel
 * @date 09/07/2026
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class SolicitudCronService {
  private readonly logger = new Logger(SolicitudCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Se ejecuta cada semana para limpiar la base de datos
   * de solicitudes que fueron rechazadas.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async limpiarSolicitudesRechazadas() {
    this.logger.log(
      'Iniciando tarea programada: limpieza de solicitudes rechazadas...',
    );

    try {
      const result = await this.prisma.solicitud.deleteMany({
        where: {
          estado: 'RECHAZADA',
        },
      });

      this.logger.log(
        `Limpieza completada. Solicitudes eliminadas: ${result.count}`,
      );
    } catch (error) {
      this.logger.error('Error al limpiar solicitudes rechazadas', error);
    }
  }
}
