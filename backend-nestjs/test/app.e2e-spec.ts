/**
 * @fileoverview Pruebas de Caja Negra (E2E) para el módulo de autenticación.
 * @requirement RF1: API de Registro, Autenticación y Control de Roles
 * @type Caja Negra — Se prueban los endpoints HTTP reales sin conocer la implementación interna.
 *
 * NOTA: Estas pruebas requieren una base de datos de prueba disponible.
 * Se configuran usando la variable de entorno DATABASE_URL del entorno de CI.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

describe('AuthController (e2e) — Caja Negra', () => {
  let app: INestApplication<App>;

  // Credenciales de prueba únicas para no depender del seed
  const testUser = {
    nombre: 'Usuario E2E Test',
    correo: `e2e-${Date.now()}@cosasdecasa.com`,
    password: 'TestPass1',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar la misma configuración que en main.ts
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Registro ────────────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('debe registrar un usuario nuevo y retornar 201 con datos públicos', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nombre', testUser.nombre);
      expect(response.body).toHaveProperty('correo', testUser.correo);
      // SEGURIDAD: passwordHash nunca debe viajar en la respuesta
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('debe retornar 409 si el correo ya está registrado', async () => {
      // El usuario ya fue registrado en el test anterior
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('debe retornar 400 si el correo tiene formato inválido', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, correo: 'no-es-un-email' })
        .expect(400);
    });

    it('debe retornar 400 si la contraseña no cumple la política mínima', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, password: 'short' })
        .expect(400);
    });
  });

  // ── Login ───────────────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('debe retornar 200 y emitir cookies HttpOnly con credenciales válidas', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: testUser.correo, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Inicio de sesión exitoso');
      // Las cookies HttpOnly deben estar presentes en el header Set-Cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies: string[] = response.headers['set-cookie'];
      expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
    });

    it('debe retornar 401 con credenciales incorrectas', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: testUser.correo, password: 'wrong-password' })
        .expect(401);
    });

    it('debe retornar 401 si el correo no existe', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: 'noexiste@test.com', password: 'any-pass1' })
        .expect(401);
    });

    it('el body de la respuesta NO debe contener el accessToken (seguridad XSS)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: testUser.correo, password: testUser.password })
        .expect(200);

      expect(response.body).not.toHaveProperty('accessToken');
      expect(response.body).not.toHaveProperty('refreshToken');
    });
  });

  // ── Ruta protegida /auth/me ─────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    it('debe retornar 401 si no se envía el token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('debe retornar 200 con los datos del usuario autenticado', async () => {
      // Primero hacemos login para obtener la cookie
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: testUser.correo, password: testUser.password });

      const cookies: string[] = loginResponse.headers['set-cookie'];

      const meResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookies)
        .expect(200);

      expect(meResponse.body).toHaveProperty('correo', testUser.correo);
      expect(meResponse.body).toHaveProperty('nombre', testUser.nombre);
      expect(meResponse.body).not.toHaveProperty('passwordHash');
    });
  });
});
