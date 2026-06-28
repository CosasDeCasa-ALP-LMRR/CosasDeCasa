/**
 * @fileoverview Auth service — login, register, logout para RF1/RF2
 * @date 27/06/2026
 */

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

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `Error ${res.status}` }));
    throw new Error(body.message ?? `Error ${res.status}`);
  }

  return res.json();
}

/** POST /auth/login — emite JWT en cookie HttpOnly */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** POST /auth/register — crea nuevo usuario */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** POST /auth/logout — limpia la cookie */
export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

/**
 * Sube o actualiza la foto de perfil del usuario
 * @param file Archivo de imagen (JPG, PNG, WEBP)
 */
export async function uploadFotoPerfil(file: File): Promise<{ message: string, fotoPerfil: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/auth/foto-perfil', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al subir la foto de perfil');
  }
  
  return await res.json();
}

export interface UserMe {
  fotoPerfil: null;
  id: string;
  nombre: string;
  rol: 'PROFESIONAL' | 'CLIENTE' | 'AUDITOR';
  correo: string;
}

/** GET /auth/me — obtiene datos del usuario actual */
export async function getMe(): Promise<UserMe> {
  return request<UserMe>('/auth/me', { method: 'GET' });
}
