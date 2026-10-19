import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { BellRing, CircleCheckBig, FileText, ScrollText, TriangleAlert, UserRound, Wrench } from 'lucide-react'

// Ejemplo de lo que vigila Cyclo mientras el sistema trabaja: una alerta que se atiende
// antes de que el cliente lo note, y una urgencia que pasa a una persona.
type Kind = 'ok' | 'alert' | 'notice' | 'fixed' | 'human' | 'report'

const EVENTS: { clock: string; kind: Kind; label: string; text: string }[] = [
  { clock: '21:14:02', kind: 'ok', label: 'Bitácora', text: 'Conversación guardada con sus 6 pasos' },
  { clock: '21:31:40', kind: 'alert', label: 'Alerta', text: 'Google Calendar dejó de dar permiso' },
  { clock: '21:31:41', kind: 'notice', label: 'Aviso', text: 'A Cyclo le llega un WhatsApp con el error' },
  { clock: '21:38:05', kind: 'fixed', label: 'Arreglado', text: 'Permiso renovado. La cita se agendó' },
  { clock: '00:32:10', kind: 'human', label: 'Persona', text: 'Urgencia pasada a la doctora con la conversación' },
  { clock: 'día 1', kind: 'report', label: 'Reporte', text: 'Resumen del mes enviado al dueño' },
]

const ICON: Record<Kind, typeof BellRing> = {
  ok: ScrollText,
  alert: TriangleAlert,
  notice: BellRing,
  fixed: Wrench,
  human: UserRound,
  report: FileText,
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const STEP_MS = 900

export default function OpsPanel() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [shown, setShown] = useState(reduce ? EVENTS.length : 1)

  // Los eventos llegan uno por uno la primera vez que el panel entra en pantalla.
  useEffect(() => {
    if (reduce) {
      setShown(EVENTS.length)
      return
    }
    if (!inView) return
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= EVENTS.length) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [inView, reduce])

  const fixed = shown >= 4

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl bg-raised ring-1 ring-inset ring-line">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <p className="text-[0.8rem] font-semibold text-fg">
          Panel de operación <span className="font-normal text-muted">· ejemplo</span>
        </p>
        <p className="mono flex items-center gap-2 text-[0.72rem] text-muted">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${shown >= 2 && !fixed ? 'live-dot bg-[#f2a28c]' : 'bg-teal-text'}`}
          />
          {shown >= 2 && !fixed ? '1 alerta abierta' : 'todo en orden'}
        </p>
      </div>
      <ol className="mono flex flex-col gap-1 px-3 py-3 text-[0.76rem] leading-snug sm:px-4" aria-label="Ejemplo de eventos del panel">
        {EVENTS.map((e, i) => {
          const Icon = ICON[e.kind]
          const visible = i < shown
          const alert = e.kind === 'alert'
          return (
            <motion.li
              key={e.clock}
              initial={false}
              animate={{ opacity: visible ? 1 : 0.18, y: visible ? 0 : 4 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={`grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-lg px-2.5 py-2 ${
                e.kind === 'human' ? 'bg-teal-deep' : alert && visible && !fixed ? 'bg-sunken ring-1 ring-inset ring-[#f2a28c]/50' : ''
              }`}
            >
              {alert && fixed ? (
                <CircleCheckBig aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 text-teal-text" />
              ) : (
                <Icon aria-hidden="true" className={`mt-0.5 h-3.5 w-3.5 ${alert ? 'text-[#f2a28c]' : 'text-teal-text'}`} />
              )}
              <span className="min-w-0">
                <span className="flex flex-wrap gap-x-2">
                  <span className="tabular text-muted">{e.clock}</span>
                  <span className={alert && !fixed ? 'text-[#f2a28c]' : 'text-teal-text'}>
                    {alert && fixed ? 'Alerta cerrada' : e.label}
                  </span>
                </span>
                <span className="block text-fg/90">{e.text}</span>
              </span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
