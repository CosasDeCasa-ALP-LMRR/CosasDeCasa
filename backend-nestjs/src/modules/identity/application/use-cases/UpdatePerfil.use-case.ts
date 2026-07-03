/**
 * @fileoverview Caso de uso para actualizar la información (biografía, disponibilidad, etc.) del perfil del profesional.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se desacopló UpdatePerfilUseCase del DTO de respuesta MiPerfilResponseDto.
 *          El use case trabaja con la entidad de dominio Perfil internamente (via IPerfilRepository),
 *          y al final delega a GetPerfilUseCase para construir el DTO de respuesta.
 *          Esto preserva la separación entre capa de dominio y capa de presentación.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { Perfil } from '../../domain/entities/Perfil';
import { UpdatePerfilDto } from '../dtos/UpdatePerfil.dto';
import { GetPerfilUseCase } from './GetPerfil.use-case';
import { MiPerfilResponseDto } from '../dtos/response/MiPerfil.response-dto';

@Injectable()
export class UpdatePerfilUseCase {
  constructor(
    private readonly perfilRepository: IPerfilRepository,
    private readonly getPerfilUseCase: GetPerfilUseCase,
  ) {}

  async execute(usuarioId: string, dto: UpdatePerfilDto): Promise<MiPerfilResponseDto> {
    // 1. Obtener entidad de dominio desde el repositorio
    let perfilEntity = await this.perfilRepository.findByUsuarioId(usuarioId);

    if (!perfilEntity) {
      // Auto-crear perfil vacío si no existe
      perfilEntity = await this.perfilRepository.save(
        new Perfil(
          randomUUID(),
          usuarioId,
          null, null, null, [], null, null, null,
          false, 'PENDIENTE', 0.0, null,
        ),
      );
    }

    // 2. Aplicar cambios sobre la entidad de dominio
    if (dto.telefono !== undefined) perfilEntity.telefono = dto.telefono;
    if (dto.biografia !== undefined) perfilEntity.biografia = dto.biografia;
    if (dto.categoriaPrincipal !== undefined)
      perfilEntity.categoriaPrincipal = dto.categoriaPrincipal;
    if (dto.etiquetas !== undefined) perfilEntity.etiquetas = dto.etiquetas;
    if (dto.aceptaUrgencias !== undefined)
      perfilEntity.aceptaUrgencias = dto.aceptaUrgencias;
    if (dto.diasYHorarios !== undefined)
      perfilEntity.diasYHorarios = dto.diasYHorarios;

    // 3. Persistir cambios (operación de dominio)
    await this.perfilRepository.save(perfilEntity);

    // 4. Retornar DTO de respuesta con todos los campos del profesional
    //    GetPerfilUseCase.executeByUsuarioId hace el select explícito en Prisma
    //    y mapea a MiPerfilResponseDto — garantizando que el DTO es el contrato público.
    return this.getPerfilUseCase.executeByUsuarioId(usuarioId);
  }
}
