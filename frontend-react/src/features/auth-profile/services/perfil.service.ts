/**
 * @fileoverview API service for RF2 - Professional Profile endpoints
 * @author Frontend RF2
 * @date 27/06/2026
 */
/**
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RF12: Interfaz de Autenticación y Enrutamiento por Roles
 * @requirement RNF7: Manejo de Sesión Transparente y Envío de Credenciales
 * @changes Se migró de fetch manual a la instancia global de Axios (src/lib/axios.ts)
 *          para garantizar withCredentials: true en todas las peticiones y
 *          aprovechar el interceptor de renovación automática de tokens.
 */

import api from '../../../lib/axios';
import type { Perfil, UpdatePerfilPayload } from '../types/perfil.types';

/** GET /identity/perfiles/mi — obtener mi perfil (profesional autenticado) */
export async function getMiPerfil(): Promise<Perfil> {
  const { data } = await api.get<Perfil>('/identity/perfiles/mi');
  return data;
}

/** GET /identity/perfiles/:id — perfil público */
export async function getPerfilPublico(id: string): Promise<Perfil> {
  const { data } = await api.get<Perfil>(`/identity/perfiles/${id}`);
  return data;
}

/** PUT /identity/perfiles — actualizar perfil */
export async function updatePerfil(payload: UpdatePerfilPayload): Promise<Perfil> {
  const { data } = await api.put<Perfil>('/identity/perfiles', payload);
  return data;
}

/**
 * POST /identity/perfiles/documentos — subir documento al portafolio.
 * Se envía como FormData porque incluye el archivo binario.
 * El campo `consentimientoIA` será añadido en RF3.
 */
export async function uploadDocumento(
  file: File,
  tipo: string,
  consentimientoIA: boolean = false,
): Promise<{ id: string; urlArchivo: string; tipo: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  formData.append('consentimientoIA', String(consentimientoIA));

  const { data } = await api.post<{ id: string; urlArchivo: string; tipo: string }>(
    '/identity/perfiles/documentos',
    formData,
    {
      // Al pasar FormData, Axios establece automáticamente el Content-Type
      // con el boundary correcto — no se sobrescribe manualmente.
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

/** DELETE /identity/perfiles/documentos/:id — eliminar documento */
export async function deleteDocumento(documentoId: string): Promise<void> {
  await api.delete(`/identity/perfiles/documentos/${documentoId}`);
}

/** DELETE /identity/perfiles/cuenta — solicitar cancelación de cuenta (Derechos ARCO) */
export async function cancelAccount(justificacion: string): Promise<{ message: string; status: string }> {
  const { data } = await api.delete<{ message: string; status: string }>('/identity/perfiles/cuenta', {
    data: { justificacion }
  });
  return data;
}
