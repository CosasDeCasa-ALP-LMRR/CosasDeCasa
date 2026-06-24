/**
 * @fileoverview Caso de uso para actualizar la información (biografía, disponibilidad, etc.) del perfil del profesional.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable } from '@nestjs/common';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { Perfil } from '../../domain/entities/Perfil';
import { UpdatePerfilDto } from '../dtos/UpdatePerfil.dto';
import { GetPerfilUseCase } from './GetPerfil.use-case';

@Injectable()
export class UpdatePerfilUseCase {
  constructor(
    private readonly perfilRepository: IPerfilRepository,
    private readonly getPerfilUseCase: GetPerfilUseCase
  ) {}

  async execute(usuarioId: string, dto: UpdatePerfilDto): Promise<Perfil> {
    const perfil = await this.getPerfilUseCase.executeByUsuarioId(usuarioId);

    // Update domain properties
    if (dto.telefono !== undefined) perfil.telefono = dto.telefono;
    if (dto.biografia !== undefined) perfil.biografia = dto.biografia;
    if (dto.categoriaPrincipal !== undefined) perfil.categoriaPrincipal = dto.categoriaPrincipal;
    if (dto.etiquetas !== undefined) perfil.etiquetas = dto.etiquetas;
    if (dto.aceptaUrgencias !== undefined) perfil.aceptaUrgencias = dto.aceptaUrgencias;
    if (dto.diasYHorarios !== undefined) perfil.diasYHorarios = dto.diasYHorarios;

    return await this.perfilRepository.save(perfil);
  }
}
