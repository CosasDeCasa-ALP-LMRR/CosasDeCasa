/**
 * @fileoverview Auth service — login, register, logout, refresh y getMe.
 *
 * RF12 — Interfaz de Autenticación y Enrutamiento por Roles
 * RNF7  — Manejo de Sesión Transparente y Envío de Credenciales
 *
 * Usa la instancia global de Axios (src/lib/axios.ts) que:
 *  - adjunta cookies HttpOnly automáticamente (withCredentials: true)
 *  - renueva el access_token de forma transparente si recibe un 401
 *
 * @author Luis Manuel (RF12/RNF7 — migración a Axios)
 * @date 28/06/2026
 */

import api from '../../../lib/axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  correo: string;
  password: string;
  rol?: 'CLIENTE' | 'PROFESIONAL';
}

export interface AuthResponse {
  message: string;
}

export interface UserMe {
  id: string;
  nombre: string;
  rol: 'PROFESIONAL' | 'CLIENTE' | 'AUDITOR';
  correo: string;
  fotoPerfil: string | null;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * El backend inyecta el JWT en cookie HttpOnly — nunca en el body.
 * withCredentials: true garantiza que el navegador guarde y envíe la cookie.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

/**
 * POST /auth/register
 * Crea una nueva cuenta. La contraseña se encripta en el backend (bcrypt).
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

/**
 * POST /auth/logout
 * El backend revoca el refresh_token en BD y borra ambas cookies.
 * Requiere que el access_token cookie esté vigente (JwtAuthGuard).
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/**
 * POST /auth/refresh
 * Solicita un nuevo access_token usando el refresh_token cookie.
 * Normalmente lo llama el interceptor de Axios automáticamente en 401.
 * Se expone aquí para uso manual si fuera necesario.
 */
export async function refreshToken(): Promise<void> {
  await api.post('/auth/refresh');
}

/**
 * POST /auth/foto-perfil
 * Sube o reemplaza la foto de perfil del usuario autenticado.
 */
export async function uploadFotoPerfil(
  file: File,
): Promise<{ message: string; fotoPerfil: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ message: string; fotoPerfil: string }>(
    '/auth/foto-perfil',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

/**
 * GET /auth/me
 * Obtiene los datos del usuario autenticado (id, nombre, rol, correo, fotoPerfil).
 * Si la cookie expiró, el interceptor intenta renovarla antes de rechazar.
 */
export async function getMe(): Promise<UserMe> {
  const { data } = await api.get<UserMe>('/auth/me');
  return data;
}
