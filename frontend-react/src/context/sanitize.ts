/**
 * Sanitización mínima para prevenir inyección XSS.
 * RNF2: bloquear renderización de HTML no escapado.
 *
 * React normalmente escapa texto al usar {string}.
 * Aun así, limpiamos patrones peligrosos (tags HTML, atributos event-like y
 * esquemas javascript/data cuando vienen como texto).
 */

const DEFAULT_MAX_LEN = 5000;

export function sanitizeText(input: unknown, maxLen: number = DEFAULT_MAX_LEN): string {
  if (input === null || input === undefined) return '';

  let s = typeof input === 'string' ? input : String(input);
  if (s.length > maxLen) s = s.slice(0, maxLen);

  // Eliminar control chars sin usar regex con escapes problemáticos.
  // Conservamos: tab(9), LF(10), CR(13) y caracteres imprimibles (32..126)
  // Eliminamos: NULL y DEL.
  s = s
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('');

  // Eliminar cualquier tag HTML, incluidos scripts e iframes.
  s = s.replace(/<\s*\/??\s*[^>]+>/gi, '');

  // Eliminar atributos event-like (onclick=, onerror=, etc.) y valores peligrosos.
  s = s.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '');
  s = s.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  // Eliminar esquemas peligrosos y referencias a código embebido.
  s = s.replace(/(javascript:|data:|vbscript:|chrome:|mocha:)/gi, '');

  return s;
}

const SUSPICIOUS_INPUT_PATTERN = new RegExp('<[^>]*>|javascript:|data:|vbscript:|on\\w+\\s*=', 'gi');

export function isSuspiciousText(input: unknown): boolean {
  if (input === null || input === undefined) return false;
  const s = typeof input === 'string' ? input : String(input);
  return SUSPICIOUS_INPUT_PATTERN.test(s);
}

export function sanitizeArrayStrings(values: unknown, maxLenPerItem = 200): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => sanitizeText(v, maxLenPerItem).trim())
    .filter((v) => v.length > 0);
}

