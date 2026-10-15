// Limpieza de lo que la gente escribe en el formulario de contacto.
//
// React ya escapa todo lo que se pinta en la página, así que aquí no hay riesgo de XSS
// en el sitio. Esta capa protege lo que viene después: el WhatsApp que llega por n8n,
// las hojas de cálculo (fórmulas que empiezan con =, +, - o @) y cualquier flujo de IA
// que lea el texto. El webhook vuelve a validar todo del lado del servidor.

export const LIMITS = {
  nombre: 80,
  empresa: 100,
  telefono: 20,
  email: 120,
  proceso: 1000,
} as const

export type SanitizeField = keyof typeof LIMITS

// Símbolos que no hacen falta para describir un negocio y que sirven para meter código.
const CODE_CHARS = /[<>{}[\]`\\|^~]/g
// Caracteres de control e invisibles (salvo salto de línea y tabulador en el mensaje).
// Se arma con códigos numéricos para no meter caracteres invisibles en el código fuente.
const INVISIBLE_RANGES: [number, number][] = [
  [0x00, 0x08],
  [0x0b, 0x0c],
  [0x0e, 0x1f],
  [0x7f, 0x7f],
  [0x200b, 0x200f], // espacios de ancho cero y marcas de dirección
  [0x202a, 0x202e], // anulaciones de dirección (texto que se ve al revés)
  [0x2028, 0x2029], // separadores de línea y párrafo
  [0x2060, 0x2060],
  [0xfeff, 0xfeff],
]
const INVISIBLE = new RegExp(
  '[' + INVISIBLE_RANGES.map(([a, b]) => String.fromCharCode(a) + '-' + String.fromCharCode(b)).join('') + ']',
  'g',
)
// Un valor que empieza así se ejecuta como fórmula en Google Sheets o Excel.
const FORMULA_START = /^[\s=+\-@\t\r]+/

const RULES: Record<SanitizeField, (v: string) => string> = {
  nombre: (v) => v.replace(/[^\p{L}\p{M}\s.'-]/gu, ''),
  empresa: (v) => v.replace(/[^\p{L}\p{M}\p{N}\s.,&'()/-]/gu, ''),
  telefono: (v) => v.replace(/[^\d\s+()-]/g, ''),
  email: (v) => v.replace(/[^A-Za-z0-9._%+@-]/g, ''),
  proceso: (v) => v.replace(CODE_CHARS, '').replace(/\n{3,}/g, '\n\n'),
}

/**
 * Limpia un valor mientras se escribe. Devuelve el valor limpio y si se quitó algo,
 * para poder avisarle a la persona.
 */
export function sanitizeInput(field: SanitizeField, raw: string): { value: string; removed: boolean } {
  let v = raw.normalize('NFC').replace(INVISIBLE, '')
  v = RULES[field](v)
  if (field !== 'telefono') v = v.replace(FORMULA_START, (m) => m.replace(/[=+\-@]/g, ''))
  v = v.slice(0, LIMITS[field])
  return { value: v, removed: v !== raw.normalize('NFC').slice(0, LIMITS[field]) }
}

/** Versión final para enviar: además recorta espacios y colapsa los repetidos. */
export function sanitizeForSend(field: SanitizeField, raw: string): string {
  let { value } = sanitizeInput(field, raw)
  value = value.replace(FORMULA_START, '').trim()
  if (field === 'proceso') return value.replace(/[ \t]{2,}/g, ' ')
  if (field === 'telefono') return value.replace(/\D/g, '')
  return value.replace(/\s{2,}/g, ' ')
}

// Texto que parece código aunque ya no tenga símbolos: esquemas de URL ejecutables,
// manejadores de eventos HTML y SQL típico de inyección.
const CODE_PATTERNS =
  /(javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon[a-z]{3,}\s*=|\bunion\s+(all\s+)?select\b|\bdrop\s+table\b|\binsert\s+into\b|\bdelete\s+from\b|\bselect\b[\s\S]{0,60}\bfrom\b|\bexec(ute)?\s*\(|\beval\s*\(|\bdocument\.|\bwindow\.|\bimport(xml|data|html|range)\s*\()/i

export function looksLikeCode(text: string): boolean {
  return CODE_PATTERNS.test(text)
}

export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
