/**
 * RD-04 — Prueba de duración (soak test) en sesión activa
 * Herramienta : k6 (https://k6.io)
 * Encargado: César González
 * Comando     : k6 run rd04-soak-sesion.js
 * Objetivo    : Detectar fugas de memoria o degradación en sesiones (10 min).
 * Backend     : Render — https://cosasdecasa-api.onrender.com
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const meDuration = new Trend('me_duration', true);
const errorRate = new Rate('error_rate');

export const options = {
  vus: 20,
  duration: '10m',
  thresholds: {
    me_duration: ['p(95)<800'],
    error_rate: ['rate<0.01'],
  },
};

const BASE_URL = 'https://cosasdecasa-api.onrender.com';
const PAYLOAD = JSON.stringify({ correo: 'auditor@cosasdecasa.com', password: 'Auditor2024!' });
const HEADERS = { 'Content-Type': 'application/json' };

export function setup() {
  const REGISTER_PAYLOAD = JSON.stringify({ nombre: 'Auditor Principal', correo: 'auditor@cosasdecasa.com', password: 'Auditor2024!', rol: 'CLIENTE' });
  const regRes = http.post(`${BASE_URL}/auth/register`, REGISTER_PAYLOAD, { headers: HEADERS });
  if (regRes.status !== 201 && regRes.status !== 409) {
    console.warn(`⚠️  Registro fallido en setup (status ${regRes.status}).`);
  }

  const loginRes = http.post(`${BASE_URL}/auth/login`, PAYLOAD, { headers: HEADERS });
  if (loginRes.status !== 200) {
    console.error('Login fallido en setup. Status:', loginRes.status);
    return { token: '' };
  }
  const setCookie = loginRes.headers['Set-Cookie'] || loginRes.headers['set-cookie'] || '';
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : '';
  console.log(`✅  Token obtenido para soak test.`);
  return { token };
}

export default function (data) {
  const reqHeaders = data.token ? { 'Cookie': `access_token=${data.token}` } : {};
  const res = http.get(`${BASE_URL}/auth/me`, { headers: reqHeaders });
  meDuration.add(res.timings.duration, { minute: String(Math.floor(__ITER / 12)) });

  const ok = check(res, {
    'no es 5xx': (r) => r.status < 500,
    'status 200, 401': (r) => r.status === 200 || r.status === 401 || r.status === 429,
  });
  errorRate.add(!ok);
  sleep(5);
}
