import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { ISolicitudRepository } from './domain/repositories/ISolicitudRepository';
import { PrismaSolicitudRepository } from './infrastructure/persistence/PrismaSolicitudRepository';
import { GetSolicitudesRecibidasUseCase } from './application/use-cases/GetSolicitudesRecibidas.use-case';
import { ChangeSolicitudEstadoUseCase } from './application/use-cases/ChangeSolicitudEstado.use-case';
import { CreateSolicitudUseCase } from './application/use-cases/CreateSolicitud.use-case';
import { SolicitudController } from './presentation/controllers/SolicitudController';
import { SolicitudCronService } from './application/services/solicitud-cron.service';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [SolicitudController],
  providers: [
    { provide: ISolicitudRepository, useClass: PrismaSolicitudRepository },
    GetSolicitudesRecibidasUseCase,
    ChangeSolicitudEstadoUseCase,
    CreateSolicitudUseCase,
    SolicitudCronService,
  ],
  exports: [ISolicitudRepository],
})
export class MatchModule {}
