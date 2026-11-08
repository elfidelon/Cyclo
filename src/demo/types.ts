export type Tool =
  | 'WhatsApp'
  | 'Claude'
  | 'Google Calendar'
  | 'Google Sheets'
  | 'Google Drive'
  | 'Gmail'
  | 'CRM'
  | 'PDF'
  | 'Pago'
  | 'Recordatorio'
  | 'Tu equipo'

export type Result =
  | { type: 'calendar'; title: string; when: string; detail: string }
  | { type: 'sheet'; title: string; columns: string[]; row: string[] }
  | { type: 'reminder'; when: string; text: string }
  | { type: 'file'; name: string; detail: string }
  | { type: 'crm'; name: string; status: string; tags: string[] }
  | { type: 'payment'; amount: string; detail: string }

export type ScriptItem =
  | { kind: 'msg'; from: 'cliente' | 'negocio'; time: string; text: string; file?: string }
  | { kind: 'step'; clock: string; tool: Tool; text: string; dur?: string; result?: Result }

export type Theme = {
  /** Color vivo del giro: ícono sobre fondo oscuro (tarjetas del sitio, otras demos). */
  brand: string
  /** Texto o ícono sobre `brand`. */
  ink: string
  /** Color fuerte para resaltar sobre blanco. */
  accent: string
  /** Tinte claro para fondos resaltados sobre blanco. */
  soft: string
  /** Fondo de la página de la demo. */
  tint: string
}

export type Demo = {
  slug: string
  giro: string
  /** Quién escribe por WhatsApp: "paciente", "prospecto"… */
  audience: string
  business: string
  initials: string
  hook: string
  headline: string
  sub: string
  theme: Theme
  script: ScriptItem[]
  summary: { big: string; label: string; facts: string[] }
}

