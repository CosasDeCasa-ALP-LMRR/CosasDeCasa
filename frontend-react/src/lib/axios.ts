/**
 * @fileoverview Instancia global de Axios configurada para CosasDeCasa.
 *
 * RF12 — Interfaz de Autenticación y Enrutamiento por Roles
 * RNF7  — Manejo de Sesión Transparente y Envío de Credenciales
 *
 * Cumplimiento:
 *  - withCredentials: true  → Las cookies HttpOnly (access_token + refresh_token)
 *    se adjuntan automáticamente en CADA petición. El frontend NUNCA lee ni
 *    almacena el JWT manualmente (imposible de todos modos por HttpOnly).
 *  - baseURL desde VITE_API_URL → en dev es vacío (Vite proxy lo maneja);
 *    en producción apunta al dominio HTTPS del backend.
 *  - Interceptor 401 → si el access_token expiró, intenta renovarlo una sola
 *    vez con POST /auth/refresh. Si el refresh también falla, redirige al login.
 *
 * @author Luis Manuel
 * @date 28/06/2026
 */

import axios from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// ─── Instancia principal ──────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,           // RNF7: adjunta cookies HttpOnly automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Flag interno para evitar bucles infinitos en el refresh ──────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function flushQueue(error: unknown | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  pendingQueue = [];
}

// ─── Interceptor de respuesta: manejo automático de 401 ──────────────────────
api.interceptors.response.use(
  // Respuesta exitosa: la pasa tal cual
  (response) => response,

  // Error: si es 401, intenta refrescar el access_token
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Solo actúa en errores 401 y evita reintentar el endpoint de refresh
    // ni peticiones que ya se reintentaron (para evitar bucle infinito)
    const isUnauthorized = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login');
    const alreadyRetried = originalRequest._retry;

    if (!isUnauthorized || isRefreshEndpoint || isLoginEndpoint || alreadyRetried) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolar la petición fallida
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((e) => Promise.reject(e));
    }

    // Marcar que estamos reintentando para no hacer bucle
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Intentar renovar el access token usando el refresh_token cookie
      await api.post('/auth/refresh');

      // Notificar a todas las peticiones en cola que pueden reintentarse
      flushQueue(null);

      // Reintentar la petición original con el nuevo access_token en cookie
      return api(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      // El refresh también falló → sesión terminada, redirigir al inicio
      flushQueue(refreshError);
      // Dispara un evento global para que AuthContext limpie el estado
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
