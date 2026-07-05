/**
 * @fileoverview Controlador HTTP que expone los endpoints de la API para la gestión de perfiles y portafolios.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */
/**
 * @modified 26/06/2026
 * @author Luis Manuel
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @changes Se sustituyó MockAuthGuard por JwtAuthGuard en todos los endpoints protegidos.
 *          Ahora la autenticación se valida mediante el token JWT almacenado en la cookie HttpOnly.
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RF3: Aviso de Privacidad y Consentimiento Explícito
 * @changes Se agregó la validación obligatoria de `consentimientoIA` en el endpoint POST /documentos.
 */

import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UpdatePerfilDto } from '../../application/dtos/UpdatePerfil.dto';
import { VerifyPerfilDto } from '../../application/dtos/VerifyPerfil.dto';
import { GetPerfilUseCase } from '../../application/use-cases/GetPerfil.use-case';
import { UpdatePerfilUseCase } from '../../application/use-cases/UpdatePerfil.use-case';
import { AddDocumentoUseCase } from '../../application/use-cases/AddDocumento.use-case';
import { DeleteDocumentoUseCase } from '../../application/use-cases/DeleteDocumento.use-case';
import { VerifyPerfilUseCase } from '../../application/use-cases/VerifyPerfil.use-case';
import { CancelAccountUseCase } from '../../application/use-cases/CancelAccount.use-case';

import { GetPerfilesPendientesUseCase } from '../../application/use-cases/GetPerfilesPendientes.use-case';
import { GetCancelacionesPendientesUseCase } from '../../application/use-cases/GetCancelacionesPendientes.use-case';
import { ApproveCancelacionUseCase } from '../../application/use-cases/ApproveCancelacion.use-case';
import { GetProfesionalesUseCase } from '../../application/use-cases/GetProfesionales.use-case';

@Controller('identity/perfiles')
export class PerfilController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly getPerfilUseCase: GetPerfilUseCase,
    private readonly updatePerfilUseCase: UpdatePerfilUseCase,
    private readonly addDocumentoUseCase: AddDocumentoUseCase,
    private readonly deleteDocumentoUseCase: DeleteDocumentoUseCase,
    private readonly verifyPerfilUseCase: VerifyPerfilUseCase,
    private readonly cancelAccountUseCase: CancelAccountUseCase,
    private readonly getPerfilesPendientesUseCase: GetPerfilesPendientesUseCase,
    private readonly getCancelacionesPendientesUseCase: GetCancelacionesPendientesUseCase,
    // Perfil (RF4 - Agustin Parra)
    private readonly approveCancelacionUseCase: ApproveCancelacionUseCase,
    private readonly getProfesionalesUseCase: GetProfesionalesUseCase,
  ) {}

  @Get('mi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  async getMiPerfil(@Req() req: any) {
    return await this.getPerfilUseCase.executeByUsuarioId(req.user.id);
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUDITOR')
  async getPerfilesPendientes() {
    return await this.getPerfilesPendientesUseCase.execute();
  }

  @Get('cancelaciones/pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUDITOR')
  async getCancelacionesPendientes() {
    return await this.getCancelacionesPendientesUseCase.execute();
  }

  // Perfil (RF4 - Agustin Parra)
  @Patch('cancelaciones/:id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUDITOR')
  async aprobarCancelacion(@Req() req: any, @Param('id') id: string) {
    const auditorId = req.user.id;
    this.logger.info(`Auditor ${auditorId} approved cancellation for profile ${id}`, {
      context: 'Auditor',
      autorId: auditorId,
      accion: 'APPROVE_CANCELLATION',
      afectadoId: id,
    });
    await this.approveCancelacionUseCase.execute(id);
    return {
      message: 'Cancelación aprobada y cuenta anonimizada correctamente',
    };
  }

  @Get()
  async getProfesionales() {
    // Endpoint público — cualquier usuario puede ver la lista de profesionales aprobados.
    return await this.getProfesionalesUseCase.execute();
  }

  @Get(':id')
  async getPerfilPublico(@Param('id') id: string) {
    // Endpoint público — cualquier usuario puede ver el detalle de un perfil.
    return await this.getPerfilUseCase.executeById(id);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  async updatePerfil(@Req() req: any, @Body() dto: UpdatePerfilDto) {
    return await this.updatePerfilUseCase.execute(req.user.id, dto);
  }

  @Post('documentos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumento(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body('tipo') tipo: string,
    @Body('consentimientoIA') consentimientoIA?: string,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo es requerido');
    }

    // RF3: Validación obligatoria de consentimiento para procesamiento de datos
    if (consentimientoIA !== 'true') {
      throw new BadRequestException(
        'Debe otorgar su consentimiento explícito para el tratamiento del documento mediante IA.',
      );
    }
    return await this.addDocumentoUseCase.execute(
      req.user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
      tipo,
      consentimientoIA === 'true'
    );
  }

  @Delete('documentos/:documentoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESIONAL')
  async deleteDocumento(
    @Req() req: any,
    @Param('documentoId') documentoId: string,
  ) {
    await this.deleteDocumentoUseCase.execute(req.user.id, documentoId);
    return { message: 'Documento eliminado exitosamente' };
  }

  @Patch(':id/verificacion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUDITOR')
  async verifyPerfil(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: VerifyPerfilDto,
  ) {
    const auditorId = req.user.id;
    this.logger.info(`Auditor ${auditorId} set verification status to ${dto.estado} for profile ${id}`, {
      context: 'Auditor',
      autorId: auditorId,
      accion: `VERIFY_PROFILE_${dto.estado}`,
      afectadoId: id,
    });
    return await this.verifyPerfilUseCase.execute(id, dto.estado);
  }

  @Delete('cuenta')
  @UseGuards(JwtAuthGuard)
  async cancelAccount(
    @Req() req: any,
    @Body('justificacion') justificacion: string,
  ) {
    if (!justificacion) {
      throw new BadRequestException(
        'Debe proveer una justificación para la cancelación.',
      );
    }

    const usuarioId = req.user.id;
    await this.cancelAccountUseCase.execute(usuarioId, justificacion);

    return {
      message:
        'Solicitud de cancelación recibida. Los documentos sensibles han sido eliminados de acuerdo a la Ley ARCO y la cuenta está en revisión.',
      status: 'success',
    };
  }
}
