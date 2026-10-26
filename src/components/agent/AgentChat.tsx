import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, MessageCircle, RotateCw, Table2 } from 'lucide-react'
import Logo from '../Logo'
import { MAX_MESSAGE } from '../../lib/agent'
import { useAgent } from './AgentProvider'

const SUGGESTIONS = [
  'Quiero agendar el diagnóstico',
  'Tengo una clínica dental, ¿qué harían?',
  'Soy inmobiliaria y me llegan muchos mensajes',
  '¿Puedo seguir usando mi número de WhatsApp?',
  '¿Cuánto tarda en estar funcionando?',
]

const WHATSAPP_NUMBER = '524951024002'
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function AgentChat({
  variant = 'section',
  autoFocus = false,
}: {
  variant?: 'section' | 'drawer'
  autoFocus?: boolean
}) {
  const { messages, status, error, send, retry } = useAgent()
  const reduce = useReducedMotion()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const noteId = useId()
  const sending = status === 'sending'
  const onlyGreeting = messages.length === 1

  // Baja al último mensaje cuando llega uno nuevo, cuando el agente escribe o cuando hay error.
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [messages.length, sending, error, reduce])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  // El cuadro crece hasta 4 renglones.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }, [draft])

  function submit(e?: FormEvent) {
    e?.preventDefault()
    if (sending || !draft.trim()) return
    send(draft)
    setDraft('')
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const lastAgent = messages.length > 1 ? [...messages].reverse().find((m) => m.role === 'agent') : null
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lastUser ? `Hola, vengo del sitio de Cyclo. ${lastUser.text}` : 'Hola, vengo del sitio de Cyclo.',
  )}`

  return (
    <div
      className={`flex min-h-0 flex-col ${
        variant === 'section' ? 'h-[560px] rounded-[22px] bg-sunken ring-1 ring-inset ring-line' : 'h-full bg-sunken'
      }`}
    >
      {variant === 'section' && (
        <div className="flex items-center gap-3 rounded-t-[22px] bg-[#10201f] px-4 pb-3 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg">
            <Logo className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.92rem] font-semibold text-fg">Agente de Cyclo</span>
            <span className="block text-[0.75rem] text-teal-text">{sending ? 'escribiendo…' : 'en línea'}</span>
          </span>
        </div>
      )}

      <ol
        ref={listRef}
        data-lenis-prevent
        aria-label="Conversación con el agente de Cyclo"
        className="casual flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-3 pb-3 pt-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.li
              key={m.id}
              layout={reduce ? false : 'position'}
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ transformOrigin: m.role === 'user' ? 'bottom right' : 'bottom left' }}
              className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 pb-1.5 pt-2 text-[0.92rem] leading-[1.5] text-fg ${
                m.role === 'user' ? 'self-end rounded-br-md bg-[#1d3033]' : 'self-start rounded-bl-md bg-teal-deep'
              }`}
            >
              <span className="sr-only">{m.role === 'user' ? 'Tú: ' : 'Agente: '}</span>
              {m.text}
              <span className="mono mt-0.5 flex items-center justify-end gap-2 text-[0.62rem] text-fg/60">
                {m.saved && (
                  <span className="flex items-center gap-1 text-teal-text">
                    <Table2 aria-hidden="true" className="h-3 w-3" />
                    prospecto guardado
                  </span>
                )}
                {m.time}
              </span>
            </motion.li>
          ))}
          {sending && (
            <motion.li
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-teal-deep px-3.5 py-3"
              aria-hidden="true"
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-fg" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </motion.li>
          )}
        </AnimatePresence>
      </ol>

      <p className="sr-only" aria-live="polite">
        {sending ? 'El agente está escribiendo.' : lastAgent ? `El agente respondió: ${lastAgent.text}` : ''}
      </p>

      {onlyGreeting && !sending && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="casual min-h-[36px] rounded-full px-3 text-left text-[0.82rem] text-fg ring-1 ring-inset ring-line transition-colors hover:bg-raised hover:ring-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && !sending && (
        <div role="alert" className="mx-3 mb-3 rounded-xl bg-bg/70 p-3 text-[0.85rem] ring-1 ring-inset ring-[#f2a28c]/50">
          <p className="font-semibold text-fg">{error.message}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {error.kind !== 'rate' && error.kind !== 'validation' && (
              <button
                type="button"
                onClick={retry}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-fg ring-1 ring-inset ring-line transition-colors hover:bg-raised"
              >
                <RotateCw aria-hidden="true" className="h-4 w-4" />
                Reintentar
              </button>
            )}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-fg ring-1 ring-inset ring-line transition-colors hover:bg-raised"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              Seguir por WhatsApp
            </a>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="border-t border-line p-3">
        <label htmlFor={inputId} className="sr-only">
          Escribe tu mensaje para el agente de Cyclo
        </label>
        <div className="flex items-end gap-2 rounded-2xl bg-bg/60 py-1.5 pl-3.5 pr-1.5 ring-1 ring-inset ring-line transition-shadow focus-within:ring-2 focus-within:ring-teal-text">
          <textarea
            ref={inputRef}
            id={inputId}
            rows={1}
            maxLength={MAX_MESSAGE}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="Escribe tu pregunta…"
            aria-describedby={noteId}
            className="casual min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[0.95rem] leading-snug text-fg placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-[background-color,opacity] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <p id={noteId} className="mt-2 flex justify-between gap-3 text-[0.75rem] leading-snug text-muted">
          <span>No compartas datos sensibles. La conversación queda en la bitácora de n8n de Cyclo.</span>
          {draft.length > 600 && (
            <span className="mono tabular shrink-0">
              {draft.length}/{MAX_MESSAGE}
            </span>
          )}
        </p>
      </form>
    </div>
  )
}
