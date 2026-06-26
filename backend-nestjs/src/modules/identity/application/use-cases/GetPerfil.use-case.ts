/**
 * @fileoverview Caso de uso para obtener un perfil público o auto-crear el perfil del profesional autenticado.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { Perfil } from '../../domain/entities/Perfil';
import { randomUUID } from 'crypto';

@Injectable()
export class GetPerfilUseCase {
  constructor(
    private readonly perfilRepository: IPerfilRepository
  ) {}

  async executeById(id: string): Promise<Perfil> {
    const perfil = await this.perfilRepository.findById(id);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }
    return perfil;
  }

  async executeByUsuarioId(usuarioId: string): Promise<Perfil> {
    let perfil = await this.perfilRepository.findByUsuarioId(usuarioId);
    if (!perfil) {
      // Auto-create a default empty profile for this user
      perfil = new Perfil(
        randomUUID(),
        usuarioId,
        null, // telefono
        null, // biografia
        null, // categoriaPrincipal
        [], // etiquetas
        null, // codigoPostal
        null, // municipio
        null, // estadoRep
        false, // aceptaUrgencias
        'PENDIENTE', // estadoVerificacion
        0.0, // promedioCalificacion
        null // diasYHorarios
      );
      perfil = await this.perfilRepository.save(perfil);
    }
    return perfil;
  }
}
