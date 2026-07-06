import { Injectable, Logger } from '@nestjs/common';
import { IOcrAdapter, OcrResult } from '../../domain/adapters/IOcrAdapter';

@Injectable()
export class GeminiOcrAdapter implements IOcrAdapter {
  private readonly logger = new Logger(GeminiOcrAdapter.name);
  private readonly apiKey: string;
  private readonly MODEL = 'gemini-2.5-flash';
  private readonly ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY no está configurada.');
    }
  }

  async extractIdentityData(fileBuffer: Buffer, mimeType: string): Promise<OcrResult> {
    const prompt = `
      Eres un asistente de validación de identidad estricto. 
      Por favor, analiza la siguiente imagen de una identificación oficial (INE o Cédula Profesional Mexicana).
      Extrae el Nombre completo y el CURP.
      Si la imagen está muy borrosa, no es legible, no es una identificación válida, o no encuentras ambos datos, devuelve los valores como null.
      Debes responder estrictamente con un objeto JSON (sin formato de markdown, sin texto adicional) con la siguiente estructura:
      {
        "nombre": "NOMBRES APELLIDO_PATERNO APELLIDO_MATERNO",
        "curp": "CURP_AQUI"
      }
    `;

    try {
      this.logger.log('Enviando petición HTTP directa al endpoint de Gemini...');

      const response = await fetch(`${this.ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: fileBuffer.toString('base64'),
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error('Error del servidor de Google:', JSON.stringify(data, null, 2));
        throw new Error(`Google API respondió con status ${response.status}: ${data.error?.message || 'Error desconocido'}`);
      }

      // Extraer el texto de la respuesta cruda de Google
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Limpiar backticks si Gemini los envía por error
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        nombre: parsed.nombre || null,
        curp: parsed.curp || null,
        valido: !!(parsed.nombre && parsed.curp),
      };
    } catch (error: any) {
      this.logger.error('Fallo en la validación:', error.message);

      return {
        nombre: null,
        curp: null,
        valido: false,
        motivoRechazo: `Fallo la IA: ${error.message}`,
      };
    }
  }
}

