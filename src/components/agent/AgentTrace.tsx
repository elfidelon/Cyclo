import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, Globe, History, ScrollText, Sparkles, Table2, TriangleAlert, Workflow } from 'lucide-react'
import { useAgent } from './AgentProvider'
import BrandLogo, { brandForTool } from '../BrandLogo'

const ICONS: Record<string, typeof Globe> = {
  Página: Globe,
  n8n: Workflow,
  Memoria: History,
  Claude: Sparkles,
  'Data Table': Table2,
  Agenda: CalendarCheck,
  Bitácora: ScrollText,
  Error: TriangleAlert,
}

// Lo que se ve antes del primer mensaje: los pasos reales del workflow, en orden.
const PLAN = [
  { tool: 'n8n', text: 'El webhook recibe tu mensaje, revisa de dónde viene y limita el uso.' },
  { tool: 'Memoria', text: 'Recupera lo que ya platicaron en esta conversación.' },
  { tool: 'Claude', text: 'Lee tu mensaje y contesta solo con la información de Cyclo.' },
  { tool: 'Agenda', text: 'Si quieres el diagnóstico, revisa horarios libres y aparta tu cita.' },
  { tool: 'Data Table', text: 'Si prefieres que te escribamos, guarda tu WhatsApp o correo.' },
  { tool: 'Bitácora', text: 'Cada ejecución queda registrada en n8n.' },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function useElapsed(since: number | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (since === null) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [since])
  return since === null ? 0 : Math.max(0, now - since)
}

export default function AgentTrace({ variant = 'section' }: { variant?: 'section' | 'drawer' }) {
  const { trace, status, sentAt } = useAgent()
  const reduce = useReducedMotion()
  const elapsed = useElapsed(sentAt)
  const sending = status === 'sending'
  const empty = trace.length === 0

  const label = sending
    ? `ejecutando · ${(elapsed / 1000).toFixed(1)} s`
    : status === 'error'
      ? 'con error'
      : empty
        ? 'esperando tu mensaje'
        : 'listo'

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden ${
        variant === 'section' ? 'h-[480px] rounded-2xl bg-raised ring-1 ring-inset ring-line md:h-[560px]' : 'h-full'
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <p className="text-[0.8rem] font-semibold text-fg">Lo que pasa detrás</p>
        <p className="mono flex items-center gap-2 text-[0.72rem] text-muted" aria-live="off">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${sending ? 'live-dot bg-teal-text' : status === 'error' ? 'bg-[#f2a28c]' : 'bg-faint'}`}
          />
          <span className="tabular">{label}</span>
        </p>
      </div>
      <div className="mono truncate border-b border-line/70 px-4 py-2 text-[0.7rem] text-muted sm:px-5">
        flujo: cyclo-agente · n8n cloud · claude
      </div>

      {empty ? (
        <ol
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col justify-start gap-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 md:justify-center"
          aria-label="Pasos del workflow"
        >
          {PLAN.map((p, i) => {
            const Icon = ICONS[p.tool]
            const brand = brandForTool(p.tool)
            return (
              <li key={p.tool} className="grid grid-cols-[1.75rem_auto_1fr] items-start gap-x-3">
                <span className="mono tabular pt-0.5 text-[0.75rem] text-muted" aria-hidden="true">
                  {i + 1}
                </span>
                {brand ? (
                  <BrandLogo brand={brand} className="mt-1 h-3.5 w-3.5 text-teal-text" />
                ) : (
                  <Icon aria-hidden="true" className="mt-1 h-3.5 w-3.5 text-teal-text" />
                )}
                <span>
                  <span className="mono block text-[0.72rem] text-teal-text">{p.tool}</span>
                  <span className="block text-[0.92rem] text-fg/90">{p.text}</span>
                </span>
              </li>
            )
          })}
        </ol>
      ) : (
        <ol
          className="mono flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-3 pb-4 pt-2 text-[0.74rem] leading-snug [mask-image:linear-gradient(to_bottom,transparent,black_56px)] sm:px-4"
          aria-label="Bitácora de la conversación"
        >
          <AnimatePresence initial={false}>
            {trace.slice(-14).map((row, i, rows) => {
              const Icon = ICONS[row.tool] ?? Workflow
              const brand = brandForTool(row.tool)
              const latest = i === rows.length - 1 && !sending
              const error = row.kind === 'error'
              return (
                <motion.li
                  key={row.id}
                  layout={reduce ? false : 'position'}
                  initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`grid grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-lg px-2.5 py-2 ${
                    latest ? 'bg-sunken' : ''
                  }`}
                >
                  {brand ? (
                    <BrandLogo brand={brand} className="mt-0.5 h-3.5 w-3.5 text-teal-text" />
                  ) : (
                    <Icon aria-hidden="true" className={`mt-0.5 h-3.5 w-3.5 ${error ? 'text-[#f2a28c]' : 'text-teal-text'}`} />
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap gap-x-2">
                      <span className="tabular text-muted">{row.clock}</span>
                      <span className={error ? 'text-[#f2a28c]' : 'text-teal-text'}>{row.tool}</span>
                    </span>
                    <span className="block text-fg/90">{row.text}</span>
                  </span>
                  {row.dur ? <span className="tabular text-muted">{row.dur}</span> : <span />}
                </motion.li>
              )
            })}
            {sending && (
              <motion.li
                key="pending"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-lg bg-sunken px-2.5 py-2"
              >
                <BrandLogo brand="claude" className="mt-0.5 h-3.5 w-3.5 text-teal-text" />
                <span>
                  <span className="text-teal-text">Claude</span>
                  <span className="block text-fg/90">Leyendo la conversación y redactando…</span>
                </span>
                <span className="tabular text-muted">{(elapsed / 1000).toFixed(1)} s</span>
              </motion.li>
            )}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}
