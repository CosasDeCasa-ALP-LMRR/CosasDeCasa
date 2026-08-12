/**
 * RD-02 — Prueba de pico (spike test) en autenticación
 * Herramienta : k6 (https://k6.io)
 * Comando     : k6 run rd02-spike-login.js
 * Objetivo    : Verificar que el sistema absorbe un pico repentino de 50 VU sin errores 5xx.
 * Backend     : Render — https://cosasdecasa-api.onrender.com
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const loginLatency = new Trend('login_latency', true);

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 }, // rampa 0 → 50 VU en 10 s
        { duration: '30s', target: 50 }, // mantener 50 VU por 30 s
        { duration: '10s', target: 0 }, // rampa 50 → 0 en 10 s
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    error_rate: ['rate<0.05'],  // Tasa de error < 5 % durante el pico
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
}

export default function () {
  const res = http.post(`${BASE_URL}/auth/login`, PAYLOAD, { headers: HEADERS });
  loginLatency.add(res.timings.duration);

  // 200 = éxito, 401 = credenciales (aceptable si se usa usuario incorrecto),
  // 429 = throttle del backend (comportamiento esperado y correcto bajo pico)
  const ok = check(res, {
    'no es 5xx': (r) => r.status < 500,
    'status válido': (r) => [200, 401, 429].includes(r.status),
  });
  errorRate.add(!ok);
  sleep(0.5);
}
