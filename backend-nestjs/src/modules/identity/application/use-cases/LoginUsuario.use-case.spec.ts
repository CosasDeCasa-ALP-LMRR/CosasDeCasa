/**
 * @fileoverview Pruebas unitarias para el caso de uso LoginUsuarioUseCase.
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @type Unitarias — Se mockean todas las dependencias externas (BD, JWT, Hash).
 */
import { UnauthorizedException } from '@nestjs/common';
import { LoginUsuarioUseCase } from './LoginUsuario.use-case';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { IJwtAdapter } from '../../domain/adapters/IJwtAdapter';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { Usuario } from '../../domain/entities/Usuario';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockUsuarioRepo: jest.Mocked<IUsuarioRepository> = {
  findByCorreo: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockHashAdapter: jest.Mocked<IHashAdapter> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwtAdapter: jest.Mocked<IJwtAdapter> = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
  verify: jest.fn(),
  signRefresh: jest.fn(),
  verifyRefresh: jest.fn(),
};

const mockRefreshTokenRepo: jest.Mocked<IRefreshTokenRepository> = {
  save: jest.fn(),
  findByTokenHash: jest.fn(),
  revokeByUsuarioId: jest.fn(),
};

// ── Usuario de prueba ──────────────────────────────────────────────────────────
const usuarioActivo = new Usuario(
  'uuid-test-123',
  'Usuario Test',
  'test@cosasdecasa.com',
  'hashed-password',
  'CLIENTE',
  true,
);

const usuarioInactivo = new Usuario(
  'uuid-test-456',
  'Usuario Inactivo',
  'inactivo@cosasdecasa.com',
  'hashed-password',
  'CLIENTE',
  false, // activo = false
);

// ── Suite de pruebas ───────────────────────────────────────────────────────────
describe('LoginUsuarioUseCase', () => {
  let useCase: LoginUsuarioUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUsuarioUseCase(
      mockUsuarioRepo,
      mockHashAdapter,
      mockJwtAdapter,
      mockRefreshTokenRepo,
    );
  });

  it('debe retornar accessToken y refreshToken con credenciales válidas', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(usuarioActivo);
    mockHashAdapter.compare.mockResolvedValue(true);
    mockRefreshTokenRepo.revokeByUsuarioId.mockResolvedValue(undefined);
    mockRefreshTokenRepo.save.mockResolvedValue({} as any);

    // Act
    const result = await useCase.execute({
      correo: 'test@cosasdecasa.com',
      password: 'password123',
    });

    // Assert
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
    expect(mockJwtAdapter.sign).toHaveBeenCalledWith({
      sub: usuarioActivo.id,
      role: usuarioActivo.rol,
    });
  });

  it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(null);

    // Act & Assert
    await expect(
      useCase.execute({ correo: 'noexiste@test.com', password: 'any' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockHashAdapter.compare).not.toHaveBeenCalled();
  });

  it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(usuarioActivo);
    mockHashAdapter.compare.mockResolvedValue(false);

    // Act & Assert
    await expect(
      useCase.execute({ correo: 'test@cosasdecasa.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe lanzar UnauthorizedException si la cuenta está inactiva', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(usuarioInactivo);

    // Act & Assert
    await expect(
      useCase.execute({
        correo: 'inactivo@cosasdecasa.com',
        password: 'any',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockHashAdapter.compare).not.toHaveBeenCalled();
  });

  it('debe revocar los tokens previos del usuario al hacer login exitoso', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(usuarioActivo);
    mockHashAdapter.compare.mockResolvedValue(true);
    mockRefreshTokenRepo.revokeByUsuarioId.mockResolvedValue(undefined);
    mockRefreshTokenRepo.save.mockResolvedValue({} as any);

    // Act
    await useCase.execute({
      correo: 'test@cosasdecasa.com',
      password: 'password123',
    });

    // Assert
    expect(mockRefreshTokenRepo.revokeByUsuarioId).toHaveBeenCalledWith(
      usuarioActivo.id,
    );
  });
});
