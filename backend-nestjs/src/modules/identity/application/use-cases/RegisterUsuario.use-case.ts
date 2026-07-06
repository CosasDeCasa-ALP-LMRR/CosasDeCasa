/**
 * @fileoverview Caso de uso para el registro de nuevos usuarios con encriptación de contraseña.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @modified 03/07/2026
 * @author Luis Manuel
 * @requirement RF: Prevención de Fuga de Datos (Excessive Data Exposure — OWASP)
 * @changes Se cambió el tipo de retorno de `Omit<Usuario, 'passwordHash'>` a
 *          `RegisterResponseDto`, eliminando la exposición de campos internos
 *          como activo, fechaCreacion y fechaActualizacion.
 */

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { RegisterDto } from '../dtos/Register.dto';
import { Usuario } from '../../domain/entities/Usuario';
import { RegisterResponseDto } from '../dtos/response/RegisterResponse.response-dto';

@Injectable()
export class RegisterUsuarioUseCase {
  constructor(
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IHashAdapter)
    private readonly hashAdapter: IHashAdapter,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existente = await this.usuarioRepository.findByCorreo(dto.correo);
    if (existente) {
      throw new ConflictException(
        'El correo ya se encuentra registrado en el sistema',
      );
    }

    const passwordHash = await this.hashAdapter.hash(dto.password);

    const usuario = new Usuario(
      randomUUID(),
      dto.nombre,
      dto.correo,
      passwordHash,
      dto.rol ?? 'CLIENTE',
      true,
      dto.curp,
    );

    const guardado = await this.usuarioRepository.save(usuario);

    // Mapear a DTO de respuesta — solo campos públicos mínimos
    // passwordHash, activo, fechaCreacion, fechaActualizacion — NUNCA en la respuesta
    return new RegisterResponseDto({
      id: guardado.id,
      nombre: guardado.nombre,
      correo: guardado.correo,
      rol: guardado.rol,
    });
  }
}
