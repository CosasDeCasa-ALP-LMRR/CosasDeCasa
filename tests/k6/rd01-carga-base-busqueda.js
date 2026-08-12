/**
 * RD-01 — Carga base en el endpoint de búsqueda de profesionales
 * Herramienta : k6 (https://k6.io)
 * Encargado - Cesar Gonzalez
 * Comando     : k6 run rd01-carga-base-busqueda.js
 * Objetivo    : Línea base de rendimiento bajo carga típica (10 VU × 60 s).
 * Backend     : Render — https://cosasdecasa-api.onrender.com
 *
 * NOTA Render Free Tier: el servidor hiberna tras 15 min de inactividad.
 *      Hacer una petición manual antes de correr la prueba para despertarlo:
 *      curl https://cosasdecasa-api.onrender.com/auth/me
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ── Métricas personalizadas ────────────────────────────────────────────────────
const busquedaDuration = new Trend('busqueda_duration', true);
const errorRate = new Rate('error_rate');

// ── Configuración del escenario ────────────────────────────────────────────────
export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    error_rate: ['rate<0.01'],
  },
};

const BASE_URL = 'https://cosasdecasa-api.onrender.com';
const LOGIN_PAYLOAD = JSON.stringify({ correo: 'auditor@cosasdecasa.com', password: 'Auditor2024!' });
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ── Setup: registrar (ignorar 409) y autenticar una vez ────────────────────────
export function setup() {
  const REGISTER_PAYLOAD = JSON.stringify({ nombre: 'Auditor Principal', correo: 'auditor@cosasdecasa.com', password: 'Auditor2024!', rol: 'CLIENTE' });
  const regRes = http.post(`${BASE_URL}/auth/register`, REGISTER_PAYLOAD, { headers: JSON_HEADERS });
  if (regRes.status !== 201 && regRes.status !== 409) {
    console.warn(`⚠️  Registro fallido en setup (status ${regRes.status}).`);
  }

  const res = http.post(`${BASE_URL}/auth/login`, LOGIN_PAYLOAD, { headers: JSON_HEADERS });

  if (res.status !== 200) {
    console.warn(`⚠️  Login fallido en setup (status ${res.status}). ` +
      'Verifica que el servidor de Render esté despierto y las credenciales sean correctas.');
    return { cookie: '' };
  }

  // Extraer el access_token de la cabecera Set-Cookie
  const setCookie = res.headers['Set-Cookie'] || res.headers['set-cookie'] || '';
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : '';
  console.log(`✅  Login exitoso. Token obtenido: ${token ? 'sí' : 'no'}`);
  return { token };
}

export default function (data) {
  const cookieHeader = data.token ? { 'Cookie': `access_token=${data.token}` } : {};

  // Escenario A — búsqueda con término (sin municipio, ya que no existe en SearchQueryDto)
  const resA = http.get(
    `${BASE_URL}/search/profesionales?q=plomero`,
    { headers: cookieHeader }
  );
  busquedaDuration.add(resA.timings.duration);
  const okA = check(resA, {
    'status 200 o 429': (r) => r.status === 200 || r.status === 429,
    'body es array (solo si 200)': (r) => {
      if (r.status === 429) return true;
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
    'P95 < 800ms (A)': (r) => r.timings.duration < 800,
  });
  errorRate.add(!okA);

  sleep(1);

  // Escenario B — búsqueda con término sin resultados esperados
  const resB = http.get(
    `${BASE_URL}/search/profesionales?q=termografia`,
    { headers: cookieHeader }
  );
  busquedaDuration.add(resB.timings.duration);
  const okB = check(resB, {
    'status 200 o 429': (r) => r.status === 200 || r.status === 429,
    'body es array vacío (solo si 200)': (r) => {
      if (r.status === 429) return true;
      try { const d = JSON.parse(r.body); return Array.isArray(d) && d.length === 0; } catch { return false; }
    },
  });
  errorRate.add(!okB);

  sleep(1);
}
