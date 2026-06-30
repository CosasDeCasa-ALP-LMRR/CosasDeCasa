/**
 * @fileoverview Controlador para la gestión de solicitudes de servicio.
 * @author Cesar Glez
 * @date 30/06/2026
 */

import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/guards/roles.decorator';
import { GetSolicitudesRecibidasUseCase } from '../../application/use-cases/GetSolicitudesRecibidas.use-case';
import { ChangeSolicitudEstadoUseCase } from '../../application/use-cases/ChangeSolicitudEstado.use-case';
import { CreateSolicitudUseCase } from '../../application/use-cases/CreateSolicitud.use-case';
import { ChangeSolicitudEstadoDto } from '../../application/dtos/ChangeSolicitudEstado.dto';
import { CreateSolicitudDto } from '../../application/dtos/CreateSolicitud.dto';

@Controller('match/solicitudes')
export class SolicitudController {
  constructor(
    private readonly getSolicitudesRecibidasUseCase: GetSolicitudesRecibidasUseCase,
    private readonly changeSolicitudEstadoUseCase: ChangeSolicitudEstadoUseCase,
    private readonly createSolicitudUseCase: CreateSolicitudUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  async createSolicitud(@Req() req: any, @Body() dto: CreateSolicitudDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.createSolicitudUseCase.execute(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      dto.profesionalId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      dto.descripcion ?? '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      dto.esUrgencia ?? false,
    );
  }

  @Get('recibidas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  async getSolicitudesRecibidas(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.getSolicitudesRecibidasUseCase.execute(req.user.id);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  async changeEstado(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ChangeSolicitudEstadoDto,
  ) {
    return await this.changeSolicitudEstadoUseCase.execute(
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.id,
      dto.estado,
    );
  }
}
