/**
 * @fileoverview Decorador reutilizable para sanitizar texto de DTOs y prevenir XSS.
 * Se aplica antes de que NestJS entregue el objeto transformado al controlador.
 */
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
};

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item) => item !== '');
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const raw = typeof value === 'string' ? value : String(value);

  return sanitizeHtml(raw, SANITIZE_OPTIONS).trim();
}

export function Sanitize() {
  return Transform(({ value }) => sanitizeValue(value), {
    toClassOnly: true,
  });
}
