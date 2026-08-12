import { test, expect } from '@playwright/test';

// Variables para pruebas de API
const API_URL = 'https://localhost:3000';

test.describe('Pruebas de API REST (Caja Negra)', () => {

  test.beforeAll(async ({ request }) => {
    // Asegurarnos de que el usuario existe antes de hacer login
    await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Cliente API Test',
        correo: 'cliente.api@cosasdecasa.com',
        password: 'Cliente2024!',
        rol: 'CLIENTE'
      }
    });
  });

  test('CB-01: Autenticación exitosa con credenciales válidas', async ({ request }) => {
    // 1. Enviar petición POST al endpoint de login
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        correo: 'cliente.api@cosasdecasa.com',
        password: 'Cliente2024!'
      }
    });

    // 2. Validar que el código de estado sea 200 (OK)
    expect(response.status()).toBe(200);

    // 3. Validar el cuerpo de la respuesta
    const responseBody = await response.json();
    
    // Verificar que devuelve el mensaje de éxito (el JWT va en cookie HttpOnly)
    expect(responseBody).toHaveProperty('message', 'Inicio de sesión exitoso');
  });

  test('CB-02: Rechazo de login con credenciales inválidas', async ({ request }) => {
    // 1. Enviar petición POST con contraseña errónea
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        correo: 'cliente.api@cosasdecasa.com',
        password: 'PasswordIncorrecto123!'
      }
    });

    // 2. Validar que el servidor rechace la petición con 401 Unauthorized o 429 Too Many Requests (throttler)
    expect([401, 429]).toContain(response.status());

    // 3. Validar mensaje de error en el cuerpo
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message');
  });

  test('CB-04: Búsqueda y filtrado de profesionales', async ({ request }) => {
    // 1. Enviar petición GET al endpoint de profesionales con un término de búsqueda
    const response = await request.get(`${API_URL}/search/profesionales`);

    // 2. Validar Status 200
    expect(response.status()).toBe(200);

    // 3. Validar que retorna un arreglo de resultados
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // Verificar que los usuarios retornados sean profesionales
    if (data.length > 0) {
      expect(data[0].rol).toBe('PROFESIONAL');
    }
  });

});
