/**
 * @fileoverview API service for RF2 - Professional Profile endpoints
 * @author Frontend RF2
 * @date 27/06/2026
 */

import type { Perfil, UpdatePerfilPayload } from '../types/perfil.types';

// Relative URL — Vite dev proxy forwards /identity/* → http://localhost:3000
const API_BASE = '';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/** GET /identity/perfiles/mi — obtener mi perfil (profesional autenticado) */
export async function getMiPerfil(): Promise<Perfil> {
  return request<Perfil>('/identity/perfiles/mi');
}

/** GET /identity/perfiles/:id — perfil público */
export async function getPerfilPublico(id: string): Promise<Perfil> {
  return request<Perfil>(`/identity/perfiles/${id}`);
}

/** PUT /identity/perfiles — actualizar perfil */
export async function updatePerfil(payload: UpdatePerfilPayload): Promise<Perfil> {
  return request<Perfil>('/identity/perfiles', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** POST /identity/perfiles/documentos — subir documento */
export async function uploadDocumento(
  file: File,
  tipo: string
): Promise<{ id: string; urlArchivo: string; tipo: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);

  const response = await fetch(`${API_BASE}/identity/perfiles/documentos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // NO Content-Type header: browser sets it with boundary for FormData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al subir archivo' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/** DELETE /identity/perfiles/documentos/:id — eliminar documento */
export async function deleteDocumento(documentoId: string): Promise<void> {
  await request(`/identity/perfiles/documentos/${documentoId}`, {
    method: 'DELETE',
  });
}
