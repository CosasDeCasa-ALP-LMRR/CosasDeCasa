/**
 * @fileoverview Puerto de salida (interfaz) para el gateway de WhatsApp.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros (WhatsApp Business Cloud)
 *
 * Siguiendo el principio de Inversión de Dependencias (DIP), el dominio
 * no depende de la implementación concreta de WhatsApp, sino de esta interfaz.
 * Esto permite sustituir el gateway sin tocar la lógica de negocio.
 */

export interface SendMessagePayload {
  /** Número de teléfono destino en formato E.164, ej: +521234567890 */
  destinatario: string;
  /** Mensaje de texto plano a enviar (máx. 1000 chars) */
  mensaje: string;
}

export abstract class IWhatsAppGateway {
  /**
   * Envía un mensaje de texto a través de WhatsApp Cloud API.
   * La transferencia viaja obligatoriamente por HTTPS con autenticación Bearer Token.
   */
  abstract sendTextMessage(payload: SendMessagePayload): Promise<void>;
}
