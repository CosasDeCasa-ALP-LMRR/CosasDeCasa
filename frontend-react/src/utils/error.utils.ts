/**
 * @fileoverview Utilidad global para formatear errores HTTP en mensajes amigables.
 * RF12 — Interfaz de Autenticación y Enrutamiento por Roles
 */

import type { AxiosError } from 'axios';

/**
 * Recibe un error (típicamente de Axios) y devuelve un mensaje en español
 * amigable para el usuario.
 */
export function formatApiError(error: any): string {
  // Si no es un error de Axios o no tiene respuesta, podría ser error de red
  if (!error.isAxiosError || !error.response) {
    if (error.message === 'Network Error') {
      return 'No hay conexión con el servidor. Verifica tu internet e intenta de nuevo.';
    }
    return error.message || 'Ocurrió un error inesperado.';
  }

  const axiosError = error as AxiosError<any>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  // 1. Mensajes amigables basados en código de estado HTTP
  switch (status) {
    case 400:
      // NestJS suele devolver un array de mensajes en errores de validación (class-validator)
      if (data?.message && Array.isArray(data.message)) {
        return data.message[0]; // Mostrar el primer error de validación
      }
      return data?.message || 'Datos incorrectos, por favor verifica el formulario.';
      
    case 401:
      return 'Tu sesión ha expirado o las credenciales son incorrectas.';
      
    case 403:
      return 'No tienes permisos para realizar esta acción.';
      
    case 404:
      return 'El recurso solicitado no fue encontrado.';
      
    case 409:
      return 'Este correo electrónico ya está registrado. Por favor intenta iniciar sesión o usa otro correo.';
      
    case 429:
      return 'Has hecho demasiados intentos. Por favor espera un momento e intenta de nuevo.';
      
    case 500:
    case 502:
    case 503:
    case 504:
      return 'El servidor está experimentando problemas. Por favor intenta más tarde.';
  }

  // 2. Si el backend envió un mensaje específico que no cayó en los casos anteriores
  if (data && typeof data.message === 'string') {
    return data.message;
  }

  // Fallback por defecto
  return 'Ocurrió un error al procesar tu solicitud.';
}
