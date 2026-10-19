import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { AgentError, askAgent, cleanMessage, getSessionId } from '../../lib/agent'

export type ChatMessage = { id: number; role: 'user' | 'agent'; text: string; time: string; saved?: boolean }
export type TraceRow = { id: number; clock: string; tool: string; text: string; dur?: string; kind?: 'error' }
export type AgentStatus = 'idle' | 'sending' | 'error'

type AgentContextValue = {
  messages: ChatMessage[]
  trace: TraceRow[]
  status: AgentStatus
  error: AgentError | null
  sentAt: number | null
  send: (text: string) => void
  retry: () => void
}

const STORE_KEY = 'cyclo:agente-chat'
const MIN_GAP_MS = 1200

const TZ = 'America/Mexico_City'
const hhmm = new Intl.DateTimeFormat('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
const hhmmss = new Intl.DateTimeFormat('es-MX', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function traceClock(date: Date) {
  return `${hhmmss.format(date)}.${Math.floor(date.getMilliseconds() / 100)}`
}

const GREETING =
  'Hola, soy el agente de Cyclo. Cuéntame de qué es tu negocio y qué te quita más tiempo, y te digo qué haríamos en tu caso.'

function initialState(): { messages: ChatMessage[]; trace: TraceRow[] } {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || 'null')
    if (saved && Array.isArray(saved.messages) && Array.isArray(saved.trace) && saved.messages.length) {
      return { messages: saved.messages, trace: saved.trace }
    }
  } catch {
    // Sin almacenamiento o con datos viejos: se empieza de cero.
  }
  return { messages: [{ id: 0, role: 'agent', text: GREETING, time: hhmm.format(new Date()) }], trace: [] }
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [{ messages, trace }, setLog] = useState(initialState)
  const [status, setStatus] = useState<AgentStatus>('idle')
  const [error, setError] = useState<AgentError | null>(null)
  const [sentAt, setSentAt] = useState<number | null>(null)
  const seq = useRef(Math.max(0, ...messages.map((m) => m.id), ...trace.map((t) => t.id)))
  const sessionId = useRef<string | null>(null)
  const busy = useRef(false)
  const lastSent = useRef(0)
  const lastText = useRef('')

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ messages: messages.slice(-40), trace: trace.slice(-60) }))
    } catch {
      // Igual que arriba.
    }
  }, [messages, trace])

  const run = useCallback(async (raw: string, isRetry: boolean) => {
    const message = cleanMessage(raw)
    if (!message || busy.current) return
    if (Date.now() - lastSent.current < MIN_GAP_MS) return
    busy.current = true
    lastSent.current = Date.now()
    lastText.current = message
    sessionId.current ??= getSessionId()

    const started = new Date()
    setError(null)
    setStatus('sending')
    setSentAt(started.getTime())
    setLog((log) => ({
      messages: isRetry
        ? log.messages
        : [...log.messages, { id: ++seq.current, role: 'user', text: message, time: hhmm.format(started) }],
      trace: [
        ...log.trace,
        { id: ++seq.current, clock: traceClock(started), tool: 'Página', text: 'Tu mensaje sale hacia el webhook de n8n' },
      ],
    }))

    try {
      const res = await askAgent(sessionId.current, message)
      const arrived = new Date()
      const answeredAt = new Date(started.getTime() + Math.max(0, res.ms))
      // El webhook dice qué pasó y cuánto tardó; la hora de cada paso se calcula aquí con
      // lo que se sabe: cuándo salió el mensaje, cuánto tardó el agente y cuándo llegó la respuesta.
      const rows: TraceRow[] = res.trace.map((s, i) => {
        const at =
          s.tool === 'Claude' || s.tool === 'Data Table'
            ? answeredAt
            : s.tool === 'Bitácora'
              ? arrived
              : new Date(started.getTime() + 140 + i * 90)
        return { id: ++seq.current, clock: traceClock(at), tool: s.tool, text: s.text, dur: s.dur }
      })
      setLog((log) => ({
        messages: [
          ...log.messages,
          { id: ++seq.current, role: 'agent', text: res.reply, time: hhmm.format(arrived), saved: res.saved },
        ],
        trace: [...log.trace, ...rows],
      }))
      setStatus('idle')
    } catch (e) {
      const err = e instanceof AgentError ? e : new AgentError('server', 'El agente no pudo responder ahora.')
      setLog((log) => ({
        messages: log.messages,
        trace: [...log.trace, { id: ++seq.current, clock: traceClock(new Date()), tool: 'Error', text: err.message, kind: 'error' }],
      }))
      setError(err)
      setStatus('error')
    } finally {
      busy.current = false
      setSentAt(null)
    }
  }, [])

  const send = useCallback((text: string) => void run(text, false), [run])
  const retry = useCallback(() => {
    if (lastText.current) void run(lastText.current, true)
  }, [run])

  const value = useMemo(
    () => ({ messages, trace, status, error, sentAt, send, retry }),
    [messages, trace, status, error, sentAt, send, retry],
  )
  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent necesita AgentProvider')
  return ctx
}
