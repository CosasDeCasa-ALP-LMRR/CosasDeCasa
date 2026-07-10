import api from '../../../lib/axios';

/**
 * @fileoverview Servicio de mensajería para comunicación vía WhatsApp.
 * @author Luis Manuel
 * @date 07/07/2026
 * @requirement RF9 / RF13: Contacto directo al aceptar solicitud (WhatsApp Cloud API)
 */

export interface ContactarPayload {
  telefono: string;
  mensaje: string;
}

/**
 * Envía un mensaje de contacto inicial vía WhatsApp.
 * El backend gestiona la comunicación segura con Meta Cloud API.
 */
export async function contactarPorWhatsApp(payload: ContactarPayload): Promise<void> {
  await api.post('/messaging/contactar', payload);
}
