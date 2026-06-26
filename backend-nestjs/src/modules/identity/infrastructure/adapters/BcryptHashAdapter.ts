/**
 * @fileoverview Implementación concreta de IHashAdapter utilizando la librería bcrypt.
 * @author Luis Manuel
 * @date 26/06/2026
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';

@Injectable()
export class BcryptHashAdapter implements IHashAdapter {
  private readonly SALT_ROUNDS = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
