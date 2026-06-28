/**
 * @fileoverview Caso de uso para el registro de nuevos usuarios con encriptación de contraseña.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { RegisterDto } from '../dtos/Register.dto';
import { Usuario } from '../../domain/entities/Usuario';

@Injectable()
export class RegisterUsuarioUseCase {
  constructor(
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IHashAdapter)
    private readonly hashAdapter: IHashAdapter,
  ) {}

  async execute(dto: RegisterDto): Promise<Omit<Usuario, 'passwordHash'>> {
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
    );

    const guardado = await this.usuarioRepository.save(usuario);

    // Omitir el hash de contraseña de la respuesta pública
    const { passwordHash: _, ...datoPublico } = guardado;
    return datoPublico;
  }
}
