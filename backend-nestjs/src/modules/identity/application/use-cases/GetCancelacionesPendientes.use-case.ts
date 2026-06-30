import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetCancelacionesPendientesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute() {
    return await this.prisma.solicitudCancelacion.findMany({
      where: {
        estado: 'PENDIENTE',
      },
      include: {
        usuario: true, // Para mostrar el nombre del que se quiere dar de baja
      },
    });
  }
}
