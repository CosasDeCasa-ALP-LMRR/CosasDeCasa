/**
 * @fileoverview Pruebas unitarias para el caso de uso RegisterUsuarioUseCase.
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @type Unitarias — Se mockean todas las dependencias externas (BD, Hash).
 */
import { ConflictException } from '@nestjs/common';
import { RegisterUsuarioUseCase } from './RegisterUsuario.use-case';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IHashAdapter } from '../../domain/adapters/IHashAdapter';
import { Usuario } from '../../domain/entities/Usuario';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockUsuarioRepo: jest.Mocked<IUsuarioRepository> = {
  findByCorreo: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockHashAdapter: jest.Mocked<IHashAdapter> = {
  hash: jest.fn().mockResolvedValue('hashed-password-123'),
  compare: jest.fn(),
};

// ── Usuario de prueba que se guardará ─────────────────────────────────────────
const usuarioGuardado = new Usuario(
  'uuid-nuevo',
  'Nuevo Usuario',
  'nuevo@cosasdecasa.com',
  'hashed-password-123',
  'CLIENTE',
  true,
);

// ── Suite de pruebas ───────────────────────────────────────────────────────────
describe('RegisterUsuarioUseCase', () => {
  let useCase: RegisterUsuarioUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUsuarioUseCase(mockUsuarioRepo, mockHashAdapter);
  });

  it('debe registrar un usuario nuevo y retornar sus datos públicos', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(null); // no existe
    mockUsuarioRepo.save.mockResolvedValue(usuarioGuardado);

    // Act
    const result = await useCase.execute({
      nombre: 'Nuevo Usuario',
      correo: 'nuevo@cosasdecasa.com',
      password: 'Password1',
    });

    // Assert
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('nombre', 'Nuevo Usuario');
    expect(result).toHaveProperty('correo', 'nuevo@cosasdecasa.com');
    expect(result).toHaveProperty('rol');
    // SEGURIDAD: la respuesta NO debe contener el hash de la contraseña
    expect(result).not.toHaveProperty('passwordHash');
    expect(mockHashAdapter.hash).toHaveBeenCalledWith('Password1');
  });

  it('debe lanzar ConflictException si el correo ya está registrado', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(usuarioGuardado); // ya existe

    // Act & Assert
    await expect(
      useCase.execute({
        nombre: 'Otro Usuario',
        correo: 'nuevo@cosasdecasa.com',
        password: 'Password1',
      }),
    ).rejects.toThrow(ConflictException);

    // No debe guardar si ya existe
    expect(mockUsuarioRepo.save).not.toHaveBeenCalled();
    expect(mockHashAdapter.hash).not.toHaveBeenCalled();
  });

  it('debe encriptar la contraseña antes de guardar el usuario', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(null);
    mockUsuarioRepo.save.mockResolvedValue(usuarioGuardado);

    // Act
    await useCase.execute({
      nombre: 'Nuevo Usuario',
      correo: 'nuevo@cosasdecasa.com',
      password: 'Password1',
    });

    // Assert — el hash se genera ANTES de save()
    const saveCallArgs = mockUsuarioRepo.save.mock.calls[0][0];
    expect(saveCallArgs.passwordHash).toBe('hashed-password-123');
    expect(saveCallArgs.passwordHash).not.toBe('Password1');
  });

  it('debe asignar el rol CLIENTE por defecto si no se especifica', async () => {
    // Arrange
    mockUsuarioRepo.findByCorreo.mockResolvedValue(null);
    mockUsuarioRepo.save.mockResolvedValue(usuarioGuardado);

    // Act
    await useCase.execute({
      nombre: 'Nuevo Usuario',
      correo: 'nuevo@cosasdecasa.com',
      password: 'Password1',
      // sin campo 'rol'
    });

    // Assert
    const saveCallArgs = mockUsuarioRepo.save.mock.calls[0][0];
    expect(saveCallArgs.rol).toBe('CLIENTE');
  });
});
