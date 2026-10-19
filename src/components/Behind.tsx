import { useEffect, useRef, useState } from 'react'
import { motion, MotionValue, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import BrandLogo, { Brand, BRAND_COLORS, BRAND_PATHS, BRAND_URLS, brandForTool } from './BrandLogo'
import { ArrowUpRight } from 'lucide-react'
import OpsPanel from './OpsPanel'

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

// Lo esencial de lo que no se ve: el resto vive en el método y en las preguntas.
const COMMITMENTS = [
  { title: 'Bitácora de cada conversación', body: 'Cada mensaje y cada paso quedan registrados.' },
  { title: 'Alertas antes que quejas', body: 'Si un paso falla, nos enteramos antes que tu cliente.' },
  { title: 'Una persona cuando hace falta', body: 'Urgencias y quejas pasan a tu equipo con todo el contexto.' },
]

const STACK: { brand: Brand; name: string; role: string }[] = [
  { brand: 'n8n', name: 'n8n', role: 'Orquesta cada paso' },
  { brand: 'claude', name: 'Claude', role: 'Entiende y redacta' },
  { brand: 'whatsapp', name: 'WhatsApp Business', role: 'Canal oficial de Meta' },
  { brand: 'googlecalendar', name: 'Google Calendar', role: 'Agenda las citas' },
  { brand: 'googlesheets', name: 'Google Sheets', role: 'Guarda los registros' },
  { brand: 'gmail', name: 'Gmail', role: 'Manda los correos' },
  { brand: 'googledrive', name: 'Google Drive', role: 'Archiva documentos' },
]

// Columna de cada nodo (0 a 4): el plano se dibuja de izquierda a derecha con el scroll.
const colOf = (n: Node) => COL.indexOf(n.x)

function FlowCanvas() {
  const ref = useRef<SVGSVGElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start 0.85', 'center 0.5'] })
  const [drawn, setDrawn] = useState(!!reduce)

  // Un valor por columna: cada caja se enciende cuando el trazo llega a ella.
  const c0 = useTransform(scrollYProgress, [0, 0.12], [0.2, 1])
  const c1 = useTransform(scrollYProgress, [0.12, 0.3], [0.2, 1])
  const c2 = useTransform(scrollYProgress, [0.3, 0.55], [0.2, 1])
  const c3 = useTransform(scrollYProgress, [0.55, 0.78], [0.2, 1])
  const c4 = useTransform(scrollYProgress, [0.78, 0.95], [0.2, 1])
  const cols: MotionValue<number>[] = [c0, c1, c2, c3, c4]
  // Cada arista se dibuja en el tramo que va de su columna de origen a la siguiente.
  const d01 = useTransform(scrollYProgress, [0.06, 0.3], [0, 1])
  const d12 = useTransform(scrollYProgress, [0.28, 0.55], [0, 1])
  const d23 = useTransform(scrollYProgress, [0.53, 0.78], [0, 1])
  const d34 = useTransform(scrollYProgress, [0.76, 0.95], [0, 1])
  const draws: MotionValue<number>[] = [d01, d12, d23, d34]

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > 0.97) setDrawn(true)
  })

  useEffect(() => {
    const svg = ref.current
    if (!svg || reduce || !drawn) return
    if (inView) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [inView, reduce, drawn])

  return (
    <div ref={wrap}>
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

      {EDGES.map((e) => (
        <motion.path
          key={`draw-${e.from}-${e.to}`}
          d={edgePath(e)}
          fill="none"
          stroke="#4fc4d1"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ pathLength: reduce ? 1 : draws[colOf(byId[e.from])], opacity: 0.55 }}
        />
      ))}

      {!reduce &&
        drawn &&
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
        <motion.g key={n.id} style={{ opacity: reduce ? 1 : cols[colOf(n)] }}>
          <g transform={`translate(${n.x} ${n.y})`}>
            <rect
              width={W}
              height={H}
              rx={12}
              fill={n.human ? '#004049' : '#0c1a1c'}
              stroke={n.human ? '#4fc4d1' : '#28393c'}
              strokeWidth={1}
            />
            {brandForTool(n.tool) && (
              <path
                d={BRAND_PATHS[brandForTool(n.tool)!]}
                transform="translate(16 13) scale(0.5)"
                fill={n.human ? '#dedbc8' : '#4fc4d1'}
              />
            )}
            <text
              x={brandForTool(n.tool) ? 34 : 16}
              y={24}
              className="mono"
              fontSize={11.5}
              fill={n.human ? '#dedbc8' : '#4fc4d1'}
            >
              {n.tool}
            </text>
            <text x={16} y={46} fontSize={14.5} fontWeight={600} fill="#dedbc8">
              {n.label}
            </text>
          </g>
        </motion.g>
      ))}
    </svg>
    </div>
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
          <p className="lead max-w-[46ch] lg:col-span-6">
            Así se ve por dentro el sistema de una clínica dental. Cada caja es un paso que construimos y vigilamos.
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
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-fg">
              Lo que no se ve, también es trabajo nuestro
            </h3>
            <dl className="mt-8 flex flex-col">
              {COMMITMENTS.map((c) => (
                <div key={c.title} className="border-t border-line py-5 last:border-b">
                  <dt className="text-[1.1rem] font-semibold text-fg">{c.title}</dt>
                  <dd className="mt-1 text-muted">{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-7">
            <OpsPanel />
          </div>
        </div>

        <div className="mt-20 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="text-[1.35rem] font-bold tracking-[-0.02em] text-fg">Con qué está hecho</h3>
            <p className="text-muted">Herramientas de empresas grandes, configuradas para la tuya.</p>
          </div>
          <ul className="mt-8 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-7">
            {STACK.map((s) => (
              <li key={s.brand}>
                <a
                  href={BRAND_URLS[s.brand]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 rounded-lg"
                >
                  <BrandLogo
                    brand={s.brand}
                    color={BRAND_COLORS[s.brand]}
                    className="h-8 w-8 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:scale-110"
                  />
                  <span>
                    <span className="block text-[0.85rem] font-semibold leading-tight text-fg underline-offset-4 group-hover:underline sm:text-[0.95rem]">
                      {s.name}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="ml-1 inline h-3.5 w-3.5 align-[-2px] text-muted transition-colors group-hover:text-fg"
                      />
                    </span>
                    <span className="mt-0.5 hidden text-[0.85rem] leading-snug text-muted sm:block">{s.role}</span>
                    <span className="sr-only">(abre su sitio en otra pestaña)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
