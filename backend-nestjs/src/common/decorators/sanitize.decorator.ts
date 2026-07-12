import { Transform } from 'class-transformer';
import * as xss from 'xss';

/**
 * Opciones de XSS con whitelist vacía: no se permite NINGUNA etiqueta HTML.
 * Esto es más estricto que el comportamiento por defecto de la librería xss,
 * que permite algunas etiquetas "seguras" como <b> o <i>.
 */
const STRICT_XSS_OPTIONS: xss.IFilterXSSOptions = {
  whiteList: {}, // Sin etiquetas HTML permitidas
  stripIgnoreTag: true, // Elimina el contenido de las etiquetas no permitidas
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object'], // Elimina también el contenido interno
};

/**
 * Sanitiza recursivamente un valor (string o array de strings).
 *   1. Normaliza Unicode para prevenir bypasses con caracteres similares (ｓｃｒｉｐｔ → script).
 *   2. Elimina espacios al inicio y al final (trim).
 *   3. Filtra etiquetas HTML con whitelist vacía (ninguna etiqueta permitida).
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const normalized = value.normalize('NFC'); // Normaliza caracteres Unicode equivalentes
    const trimmed = normalized.trim(); // Elimina espacios en blanco extremos
    return xss.filterXSS(trimmed, STRICT_XSS_OPTIONS);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)); // Aplica recursivamente a cada elemento
  }

  return value; // Números, booleanos, objetos — sin cambios
}

/**
 * Decorador de class-transformer que sanitiza automáticamente un campo de texto
 * para prevenir ataques XSS (Cross-Site Scripting).
 * Compatible con campos string y string[].
 */
export function Sanitize() {
  return Transform(({ value }) => sanitizeValue(value));
}
