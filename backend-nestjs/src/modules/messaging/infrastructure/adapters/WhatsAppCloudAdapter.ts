/**
 * @fileoverview Implementación concreta del gateway de WhatsApp usando la
 * WhatsApp Business Cloud API de Meta.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros
 *
 * SEGURIDAD:
 *  - La comunicación viaja exclusivamente por HTTPS (TLS 1.3) hacia graph.facebook.com.
 *  - La autenticación con Meta se realiza mediante Bearer Token, almacenado
 *    únicamente en variables de entorno (.env) y nunca en el código fuente.
 *  - Las credenciales NUNCA se exponen en las respuestas hacia el frontend.
 */

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IWhatsAppGateway,
  SendMessagePayload,
} from '../../domain/ports/IWhatsAppGateway';
import * as https from 'https';

@Injectable()
export class WhatsAppCloudAdapter implements IWhatsAppGateway {
  private readonly logger = new Logger(WhatsAppCloudAdapter.name);
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.getOrThrow<string>(
      'WHATSAPP_ACCESS_TOKEN',
    );
    this.phoneNumberId = this.configService.getOrThrow<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    this.apiVersion = this.configService.get<string>(
      'WHATSAPP_API_VERSION',
      'v21.0',
    );
  }

  /**
   * Envía un mensaje de texto plano a través de la WhatsApp Cloud API.
   * El canal es HTTPS con Bearer Token — cumple el criterio de
   * "canales cifrados con autenticación" para transferencias a terceros.
   */
  async sendTextMessage(payload: SendMessagePayload): Promise<void> {
    const { destinatario, mensaje } = payload;
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const body = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: destinatario.replace('+', ''), // Meta requiere el número sin el signo '+'
      type: 'text',
      text: {
        preview_url: false,
        body: mensaje,
      },
    });

    this.logger.log(`Enviando mensaje WhatsApp a ${destinatario}`);

    await this.doRequest(url, body);
  }

  /**
   * Realiza la petición HTTPS nativa hacia graph.facebook.com.
   * Se usa el módulo nativo `https` de Node.js para garantizar TLS sin
   * dependencias adicionales.
   */
  private doRequest(url: string, body: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);

      const options: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          // Bearer Token: autenticación segura hacia la API de Meta
          Authorization: `Bearer ${this.accessToken}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            this.logger.log(
              `WhatsApp API respondió con HTTP ${res.statusCode}`,
            );
            resolve();
          } else {
            this.logger.error(
              `WhatsApp API error HTTP ${res.statusCode}: ${data}`,
            );
            reject(
              new InternalServerErrorException(
                'Error al enviar el mensaje de WhatsApp',
              ),
            );
          }
        });
      });

      req.on('error', (err) => {
        this.logger.error(
          `Error de red al conectar con WhatsApp API: ${err.message}`,
        );
        reject(
          new InternalServerErrorException(
            'No se pudo conectar con el servicio de mensajería',
          ),
        );
      });

      req.write(body);
      req.end();
    });
  }
}
