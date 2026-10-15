import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

type Node = { id: string; x: number; y: number; tool: string; label: string; human?: boolean }

// Lienzo en unidades del viewBox (≈ px a partir de 1280 px de ancho).
const W = 168
const H = 64
const COL = [16, 208, 508, 708, 908]
const ROW = [24, 168, 312]
const NODES: Node[] = [
  { id: 'in', x: COL[0], y: ROW[1], tool: 'WhatsApp', label: 'Llega un mensaje' },
  { id: 'ai', x: COL[1], y: ROW[1], tool: 'Claude', label: '¿Qué necesita?' },
  { id: 'cal', x: COL[2], y: ROW[0], tool: 'Google Calendar', label: 'Busca horarios' },
  { id: 'book', x: COL[3], y: ROW[0], tool: 'Calendar + Sheets', label: 'Agenda y registra' },
  { id: 'rem', x: COL[4], y: ROW[0], tool: 'Recordatorio', label: '24 h y 2 h antes' },
  { id: 'kb', x: COL[2], y: ROW[1], tool: 'Tu información', label: 'Tus precios' },
  { id: 'reply', x: COL[3], y: ROW[1], tool: 'WhatsApp', label: 'Responde la duda' },
  { id: 'human', x: COL[2], y: ROW[2], tool: 'Tu equipo', label: 'Recibe el caso', human: true },
  { id: 'follow', x: COL[3], y: ROW[2], tool: 'WhatsApp', label: 'Sigue una persona' },
]

type Edge = { from: string; to: string; label?: string }
const EDGES: Edge[] = [
  { from: 'in', to: 'ai' },
  { from: 'ai', to: 'cal', label: 'cita' },
  { from: 'cal', to: 'book' },
  { from: 'book', to: 'rem' },
  { from: 'ai', to: 'kb', label: 'precio o duda' },
  { from: 'kb', to: 'reply' },
  { from: 'ai', to: 'human', label: 'urgencia o queja' },
  { from: 'human', to: 'follow' },
]

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))

function ends(e: Edge) {
  const a = byId[e.from]
  const b = byId[e.to]
  return { x1: a.x + W, y1: a.y + H / 2, x2: b.x, y2: b.y + H / 2 }
}

function edgePath(e: Edge) {
  const { x1, y1, x2, y2 } = ends(e)
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

const COMMITMENTS = [
  {
    title: 'Bitácora de cada conversación',
    body: 'Cada mensaje y cada paso quedan registrados. Si un cliente dice que nadie le contestó, se revisa en minutos.',
  },
  {
    title: 'Alertas antes que quejas',
    body: 'Si un paso falla —un calendario sin permiso, un servicio caído— nos llega una alerta y lo resolvemos.',
  },
  {
    title: 'Una persona cuando hace falta',
    body: 'Urgencias, quejas y preguntas fuera de guion pasan a tu equipo con la conversación completa.',
  },
  {
    title: 'Solo dice lo que tú apruebas',
    body: 'Contesta con tus precios, horarios y políticas. Si no sabe algo, no lo inventa: se lo pregunta a tu equipo.',
  },
  {
    title: 'Tus datos, en tus cuentas',
    body: 'Contactos, citas y registros viven en tu Google Workspace. Si un día te vas, todo se queda contigo.',
  },
  {
    title: 'Ajustes cada mes',
    body: 'Revisamos conversaciones reales, afinamos respuestas y te mandamos un reporte de lo que atendió el sistema.',
  },
]

const STACK = [
  { name: 'n8n', role: 'Orquesta cada paso del flujo y guarda la bitácora de ejecuciones.' },
  { name: 'Claude, de Anthropic', role: 'Entiende los mensajes y redacta las respuestas con tu información.' },
  { name: 'WhatsApp Business API', role: 'El canal oficial de Meta para que una empresa atienda por WhatsApp.' },
  { name: 'Google Workspace', role: 'Calendar, Sheets, Gmail y Drive: donde ya trabaja tu negocio.' },
]

function FlowCanvas() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduce = useReducedMotion()

  useEffect(() => {
    const svg = ref.current
    if (!svg || reduce) return
    if (inView) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [inView, reduce])

  return (
    <svg
      ref={ref}
      viewBox="0 0 1092 400"
      className="h-auto w-full"
      role="img"
      aria-labelledby="flujo-titulo flujo-desc"
    >
      <title id="flujo-titulo">Flujo de un sistema de agenda para clínica dental</title>
      <desc id="flujo-desc">
        Un mensaje de WhatsApp llega y Claude decide qué necesita. Si es una cita, busca horarios en Google Calendar,
        agenda, registra en Sheets y programa recordatorios 24 y 2 horas antes. Si es una duda de precio, responde con la
        información aprobada del negocio. Si es una urgencia o una queja, avisa a una persona del equipo y le pasa el
        contexto.
      </desc>

      {EDGES.map((e) => (
        <path key={e.from + e.to} id={`edge-${e.from}-${e.to}`} d={edgePath(e)} fill="none" stroke="#28393c" strokeWidth={1.5} />
      ))}

      {!reduce &&
        EDGES.map((e, i) => (
          <circle key={`p-${e.from}-${e.to}`} r={3.5} fill="#4fc4d1">
            <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${(i * 0.37) % 2.6}s`}>
              <mpath href={`#edge-${e.from}-${e.to}`} />
            </animateMotion>
          </circle>
        ))}

      {EDGES.filter((e) => e.label).map((e) => {
        const { x1, y1, x2, y2 } = ends(e)
        const w = e.label!.length * 6.7 + 18
        return (
          <g key={`l-${e.to}`} transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`}>
            <rect x={-w / 2} y={-11} width={w} height={22} rx={11} fill="#071416" stroke="#28393c" />
            <text y={4} textAnchor="middle" className="mono" fontSize={11} fill="#a7a596">
              {e.label}
            </text>
          </g>
        )
      })}

      {NODES.map((n) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <rect
            width={W}
            height={H}
            rx={12}
            fill={n.human ? '#004049' : '#0c1a1c'}
            stroke={n.human ? '#4fc4d1' : '#28393c'}
            strokeWidth={1}
          />
          <text x={16} y={24} className="mono" fontSize={11.5} fill={n.human ? '#dedbc8' : '#4fc4d1'}>
            {n.tool}
          </text>
          <text x={16} y={46} fontSize={14.5} fontWeight={600} fill="#dedbc8">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function FlowList() {
  const branches = [
    { when: 'Si quiere una cita', steps: ['Google Calendar · busca horarios', 'Calendar + Sheets · agenda y registra', 'Recordatorio · 24 h y 2 h antes'] },
    { when: 'Si pregunta un precio o una duda', steps: ['Tu información · tus precios y políticas', 'WhatsApp · responde la duda'] },
    { when: 'Si es una urgencia o una queja', steps: ['Tu equipo · recibe el caso con el contexto', 'WhatsApp · sigue una persona'] },
  ]
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-hidden="true">
      <div className="rounded-xl bg-raised px-4 py-3 ring-1 ring-inset ring-line md:col-span-3">
        <p className="mono text-[0.72rem] text-teal-text">WhatsApp → Claude</p>
        <p className="font-semibold text-fg">Llega el mensaje y decide qué necesita</p>
      </div>
      {branches.map((b) => (
        <div key={b.when} className="rounded-xl px-4 py-3 ring-1 ring-inset ring-line">
          <p className="mono text-[0.72rem] text-faint">{b.when}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {b.steps.map((s) => (
              <li key={s} className="text-[0.95rem] text-fg/90">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function Behind() {
  const headRef = useRef<HTMLHeadingElement>(null)
  const headIn = useInView(headRef, { once: true, margin: '-25% 0px' })

  return (
    <section id="detras" aria-labelledby="detras-titulo" className="py-24 sm:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 ref={headRef} id="detras-titulo" className="heading text-fg lg:col-span-6">
            Lo que hay{' '}
            <span className="morph-mono text-teal-text" data-on={headIn ? 'true' : 'false'}>
              detrás
            </span>
          </h2>
          <p className="lead max-w-[52ch] lg:col-span-6">
            Un mensaje de WhatsApp pasa por varias decisiones antes de contestarse. Así se ve por dentro el sistema de una
            clínica dental: cada caja es un paso que construimos, probamos y vigilamos.
          </p>
        </div>

        <div className="canvas-dots mt-12 rounded-2xl bg-[#071416] p-4 ring-1 ring-inset ring-line sm:p-6 lg:p-8">
          <div className="hidden xl:block">
            <FlowCanvas />
          </div>
          <div className="xl:hidden">
            <p className="sr-only">
              Un mensaje de WhatsApp llega y Claude decide qué necesita. Si es una cita, busca horarios, agenda, registra y
              programa recordatorios. Si es una duda, responde con la información aprobada del negocio. Si es una urgencia
              o una queja, avisa a una persona del equipo con el contexto.
            </p>
            <FlowList />
          </div>
          <p className="mono mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/70 pt-4 text-[0.75rem] text-faint">
            <span className="text-muted">Bitácora</span> cada ejecución queda registrada
            <span aria-hidden="true">·</span>
            <span className="text-muted">Alertas</span> si un paso falla, nos enteramos primero
          </p>
        </div>

        <h3 className="mt-20 text-[1.6rem] font-bold tracking-[-0.02em] text-fg">Lo que no se ve, también es trabajo nuestro</h3>
        <dl className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map((c) => (
            <div key={c.title} className="border-t border-line pt-5">
              <dt className="text-[1.1rem] font-semibold text-fg">{c.title}</dt>
              <dd className="mt-2 text-muted">{c.body}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 grid grid-cols-1 gap-8 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h3 className="text-[1.35rem] font-bold tracking-[-0.02em] text-fg">Con qué está hecho</h3>
            <p className="mt-2 text-muted">
              Las mismas herramientas que usan empresas mucho más grandes, configuradas a la medida de la tuya.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-8">
            {STACK.map((s) => (
              <li key={s.name}>
                <p className="mono text-[0.85rem] font-semibold text-teal-text">{s.name}</p>
                <p className="mt-1 text-fg/90">{s.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
