/**
 * RD-03 — Prueba de estrés en carga de perfil público de profesional
 * Herramienta : k6 (https://k6.io)
 * Comando     : k6 run -e PERFIL_ID=<uuid> rd03-estres-perfil-publico.js
 * Objetivo    : Identificar el punto de ruptura (5 → 100 VU en 120 s).
 * Backend     : Render — https://cosasdecasa-api.onrender.com
 *
 * NOTA: sustituir PERFIL_ID por el ID real de un perfil verificado con portafolio.
 *       Obtenerlo desde la BD o la respuesta de GET /identity/perfiles/mi
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const perfilDuration = new Trend('perfil_duration', true);
const errorRate = new Rate('error_rate');

// El PERFIL_ID se obtiene dinámicamente en la función setup()

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '40s', target: 30 },
        { duration: '40s', target: 60 },
        { duration: '40s', target: 100 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'perfil_duration{phase:bajo50}': ['p(95)<2000'],
    error_rate: ['rate<0.05'],
  },
};

const BASE_URL = 'https://cosasdecasa-api.onrender.com';

export function setup() {
  const PRO_PAYLOAD = JSON.stringify({ nombre: 'Profesional Prueba', correo: 'pro.prueba@cosasdecasa.com', password: 'ProPassword2024!', rol: 'PROFESIONAL' });
  const regRes = http.post(`${BASE_URL}/auth/register`, PRO_PAYLOAD, { headers: { 'Content-Type': 'application/json' } });
  if (regRes.status !== 201 && regRes.status !== 409) {
    console.warn(`⚠️  Registro de profesional fallido en setup (status ${regRes.status}).`);
  }

  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ correo: 'pro.prueba@cosasdecasa.com', password: 'ProPassword2024!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const setCookie = loginRes.headers['Set-Cookie'] || loginRes.headers['set-cookie'] || '';
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : '';

  // Auto-crear perfil haciendo GET a /identity/perfiles/mi
  let perfilId = '';
  if (token) {
    const miPerfilRes = http.get(`${BASE_URL}/identity/perfiles/mi`, {
      headers: { 'Cookie': `access_token=${token}` }
    });
    if (miPerfilRes.status === 200) {
      try {
        const perfil = JSON.parse(miPerfilRes.body);
        perfilId = perfil.id;
      } catch (e) {
        console.warn('No se pudo parsear el perfil', e);
      }
    }
  }

  return { token, perfilId };
}

export default function (data) {
  const perfilId = data.perfilId || 'invalid-id';
  const cookieHeader = data.token ? { 'Cookie': `access_token=${data.token}` } : {};
  const res = http.get(
    `${BASE_URL}/identity/perfiles/${perfilId}`,
    { headers: cookieHeader }
  );
  perfilDuration.add(res.timings.duration, { phase: __VU <= 50 ? 'bajo50' : 'sobre50' });

  const ok = check(res, {
    'status 200 o 429': (r) => r.status === 200 || r.status === 429,
    'P95 < 2000ms': (r) => r.timings.duration < 2000,
  });
  if (res.status !== 200 && res.status !== 429) {
    console.warn(`[VU ${__VU}] Error inesperado: HTTP ${res.status} al solicitar ${res.url}`);
  }
  errorRate.add(!ok);
  sleep(1);
}
