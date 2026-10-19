// Cliente del agente del sitio: el workflow "Cyclo · Agente del sitio" en n8n cloud.
// El webhook valida, limita el uso y contesta con Claude; aquí solo se manda el mensaje
// y se traduce cada respuesta (o error) a algo que la página pueda mostrar.

import { INVISIBLE } from './sanitize'

const AGENT_URL = import.meta.env.VITE_N8N_AGENT_URL
const TIMEOUT_MS = 45_000
const SESSION_KEY = 'cyclo:agente-sesion'

export const MAX_MESSAGE = 800

export type TraceStep = { tool: string; text: string; dur?: string }

export type AgentReply = {
  reply: string
  trace: TraceStep[]
  ms: number
  saved: boolean
  execution: string
}

export type AgentErrorKind = 'rate' | 'validation' | 'server' | 'network' | 'timeout'

export class AgentError extends Error {
  constructor(
    public kind: AgentErrorKind,
    message: string,
    public retryAfter?: number,
  ) {
    super(message)
  }
}

/** Un id por pestaña: la memoria del agente en n8n se guarda con esta llave. */
export function getSessionId(): string {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY)
    if (saved && /^[A-Za-z0-9-]{8,64}$/.test(saved)) return saved
  } catch {
    // Sin almacenamiento: la conversación dura lo que dure la pestaña.
  }
  const id = window.crypto.randomUUID()
  try {
    window.sessionStorage.setItem(SESSION_KEY, id)
  } catch {
    // Igual que arriba.
  }
  return id
}

/** Quita caracteres invisibles y de control, junta espacios repetidos y recorta. */
export function cleanMessage(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(INVISIBLE, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_MESSAGE)
}

function isReply(data: unknown): data is AgentReply {
  return !!data && typeof data === 'object' && typeof (data as AgentReply).reply === 'string'
}

export async function askAgent(sessionId: string, message: string): Promise<AgentReply> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'strict-origin',
      signal: ctrl.signal,
      body: JSON.stringify({ sessionId, message }),
    })
  } catch {
    throw ctrl.signal.aborted
      ? new AgentError('timeout', 'El agente tardó demasiado en contestar.')
      : new AgentError('network', 'No hay conexión con el agente.')
  } finally {
    window.clearTimeout(timer)
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // Respuesta sin JSON: se trata abajo como error del servidor.
  }

  if (res.ok && isReply(data)) {
    return {
      reply: data.reply.trim(),
      trace: Array.isArray(data.trace) ? data.trace.filter((s) => s && typeof s.text === 'string') : [],
      ms: Number(data.ms) || 0,
      saved: Boolean(data.saved),
      execution: String(data.execution ?? ''),
    }
  }

  const serverMessage =
    data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
      ? (data as { message: string }).message
      : ''
  if (res.status === 429) {
    const retry = Number((data as { retry_after?: unknown } | null)?.retry_after) || undefined
    throw new AgentError('rate', serverMessage || 'Demasiados mensajes seguidos.', retry)
  }
  if (res.status === 400 || res.status === 403) {
    throw new AgentError('validation', serverMessage || 'El agente no pudo leer ese mensaje.')
  }
  throw new AgentError('server', serverMessage || 'El agente no pudo responder ahora.')
}
