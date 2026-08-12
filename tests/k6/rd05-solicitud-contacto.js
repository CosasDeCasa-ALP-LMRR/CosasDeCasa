/**
 * RD-05 — Rendimiento del endpoint de envío de solicitud de contacto
 * Herramienta : k6 (https://k6.io)
 * Encargado: César González
 * Comando     : k6 run -e PROFESIONAL_ID=<uuid> rd05-solicitud-contacto.js
 * Objetivo    : Medir latencia de escritura en BD bajo concurrencia (30 VU × 60 s).
 * Backend     : Render — https://cosasdecasa-api.onrender.com
 *
 * NOTA: Obtener PROFESIONAL_ID desde la BD o la respuesta de GET /search/profesionales
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const solicitudDuration = new Trend('solicitud_duration', true);
const errorRate = new Rate('error_rate');

export const options = {
  vus: 30,
  duration: '60s',
  thresholds: {
    solicitud_duration: ['p(95)<1200'],
    error_rate: ['rate<0.02'],
  },
};

const BASE_URL = 'https://cosasdecasa-api.onrender.com';
const LOGIN_PAYLOAD = JSON.stringify({ correo: 'cliente.prueba@cosasdecasa.com', password: 'Cliente2024!' });

export function setup() {
  // 1. Registrar cliente (si no existe)
  const REGISTER_PAYLOAD = JSON.stringify({ nombre: 'Cliente Prueba', correo: 'cliente.prueba@cosasdecasa.com', password: 'Cliente2024!', rol: 'CLIENTE' });
  http.post(`${BASE_URL}/auth/register`, REGISTER_PAYLOAD, { headers: { 'Content-Type': 'application/json' } });

  // 2. Registrar profesional (para que exista a quien enviarle solicitud)
  const PRO_PAYLOAD = JSON.stringify({ nombre: 'Profesional Contacto', correo: 'pro.contacto@cosasdecasa.com', password: 'ProPassword2024!', rol: 'PROFESIONAL' });
  http.post(`${BASE_URL}/auth/register`, PRO_PAYLOAD, { headers: { 'Content-Type': 'application/json' } });

  // 3. Login del profesional y obtener su usuarioId via GET /auth/me
  let profesionalId = '';
  const proLoginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ correo: 'pro.contacto@cosasdecasa.com', password: 'ProPassword2024!' }), { headers: { 'Content-Type': 'application/json' } });

  try {
    // El login solo devuelve {"message":"Inicio de sesión exitoso"}, el id viene en el JWT cookie
    // Usamos GET /auth/me con la cookie del profesional para obtener su id
    const proTokenMatch = (proLoginRes.headers['Set-Cookie'] || proLoginRes.headers['set-cookie'] || '').match(/access_token=([^;]+)/);
    if (proTokenMatch) {
      const meRes = http.get(`${BASE_URL}/auth/me`, { headers: { 'Cookie': `access_token=${proTokenMatch[1]}` } });
      const meBody = JSON.parse(meRes.body);
      profesionalId = meBody.id || '';
      console.log(`✅ profesionalId obtenido via /auth/me: ${profesionalId}`);
    }
  } catch (e) {
    console.warn('Error obteniendo usuarioId del profesional via /auth/me');
  }

  // 4. Login del cliente que hará las peticiones de contacto
  const loginRes = http.post(`${BASE_URL}/auth/login`, LOGIN_PAYLOAD, {
    headers: { 'Content-Type': 'application/json' },
  });

  const setCookie = loginRes.headers['Set-Cookie'] || loginRes.headers['set-cookie'] || '';
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);

  return {
    token: tokenMatch ? tokenMatch[1] : '',
    profesionalId: profesionalId || 'invalid-id'
  };
}

export default function (data) {
  const cookieHeader = data.token ? { 'Cookie': `access_token=${data.token}` } : {};

  // Payload correcto según CreateSolicitudDto
  const payload = JSON.stringify({
    profesionalId: data.profesionalId,
    descripcion: `Solicitud de prueba de rendimiento. VU: ${__VU}, ITER: ${__ITER}`,
    esUrgencia: false,
  });

  const res = http.post(
    `${BASE_URL}/match/solicitudes`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...cookieHeader,
      },
    }
  );

  solicitudDuration.add(res.timings.duration);

  // Status 201 es éxito, 429 es Throttling, 409 conflicto (solicitud duplicada muy rápido)
  const ok = check(res, {
    'status 201, 409 o 429': (r) => r.status === 201 || r.status === 409 || r.status === 429,
    'P95 < 1200ms': (r) => r.timings.duration < 1200,
  });

  if (res.status !== 201 && res.status !== 409 && res.status !== 429) {
    console.warn(`[VU ${__VU}] Error inesperado al crear solicitud: HTTP ${res.status}`);
  }

  errorRate.add(!ok);

  sleep(2);
}
