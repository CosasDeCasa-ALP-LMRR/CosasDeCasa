/**
 * @fileoverview Interfaz del adaptador de OCR (Optical Character Recognition).
 * @author Cesar Gonzalez
 * @date 04/07/2026
 * @requirement RF5: Validación Automatizada de Identidad con IA (Google Gemini)
 */

export interface OcrResult {
  nombre: string | null;
  curp: string | null;
  valido: boolean;
  motivoRechazo?: string;
}

export abstract class IOcrAdapter {
  abstract extractIdentityData(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<OcrResult>;
}
