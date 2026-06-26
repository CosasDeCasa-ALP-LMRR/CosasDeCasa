/**
 * @fileoverview Caso de uso para la autenticación de usuarios y emisión de token JWT.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @requirement RNF1: Emisión de JWT y Configuración de Cookies Seguras
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { IJwtAdapter } from '../../domain/adapters/IJwtAdapter';
import { LoginDto } from '../dtos/Login.dto';

@Injectable()
export class LoginUsuarioUseCase {
  constructor(
    @Inject(IUsuarioRepository)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IHashAdapter)
    private readonly hashAdapter: IHashAdapter,
    @Inject(IJwtAdapter)
    private readonly jwtAdapter: IJwtAdapter,
  ) {}

  async execute(dto: LoginDto): Promise<string> {
    const usuario = await this.usuarioRepository.findByCorreo(dto.correo);

    // Mensaje genérico para no revelar si el correo existe o no (seguridad)
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await this.hashAdapter.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.jwtAdapter.sign({
      sub: usuario.id,
      role: usuario.rol,
    });

    return token;
  }
}
