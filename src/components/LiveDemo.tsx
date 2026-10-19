import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  BellRing,
  CalendarDays,
  CheckCheck,
  CircleCheckBig,
  FileText,
  FolderOpen,
  MessageCircle,
  Pause,
  Play,
  Sparkles,
  Table2,
  Users,
} from 'lucide-react'
import BrandLogo, { brandForTool } from './BrandLogo'

type Tool =
  | 'WhatsApp'
  | 'Claude'
  | 'Google Calendar'
  | 'Google Sheets'
  | 'Google Drive'
  | 'CRM'
  | 'PDF'
  | 'Recordatorio'
  | 'Resumen'

// Pasos tal como se escriben; los tiempos (ms) los calcula buildScript.
type Step =
  | { kind: 'in' | 'out'; time: string; text: string; file?: string }
  | { kind: 'trace'; clock: string; tool: Tool; text: string; dur?: string }

type ChatEvent = { at: number; kind: 'in' | 'out'; time: string; text: string; file?: string }
type TraceEvent = { at: number; kind: 'trace'; clock: string; tool: Tool; text: string; dur?: string }
type TypingEvent = { at: number; kind: 'typing'; until: number }
type DemoEvent = ChatEvent | TraceEvent | TypingEvent

type Scenario = {
  id: string
  label: string
  name: string
  initials: string
  audience: string
  flow: string
  caption: string
  summary: string
  steps: Step[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'dental',
    label: 'Dental',
    name: 'Clínica dental',
    initials: 'CD',
    audience: 'paciente',
    flow: 'agenda-whatsapp',
    caption: 'Demo de un sistema de agenda para clínica dental.',
    summary:
      'Una paciente escribe a las 23:47 pidiendo cita de limpieza. El sistema entiende la intención, busca horarios en Google Calendar, ofrece tres opciones, agenda la cita, la registra en Google Sheets y programa un recordatorio.',
    steps: [
      { kind: 'in', time: '23:47', text: 'Hola, buenas noches. ¿Tienen espacio para una limpieza esta semana?' },
      { kind: 'trace', clock: '23:47:02.1', tool: 'WhatsApp', text: 'Mensaje recibido · paciente nueva' },
      { kind: 'trace', clock: '23:47:02.9', tool: 'Claude', text: 'Intención: agendar · servicio: limpieza dental', dur: '1.1 s' },
      { kind: 'trace', clock: '23:47:03.4', tool: 'Google Calendar', text: 'Horarios libres jue–sáb → 3 opciones', dur: '0.4 s' },
      {
        kind: 'out',
        time: '23:47',
        text: '¡Buenas noches! Sí tenemos. Para limpieza dental te puedo ofrecer:\n· Jueves 10:00\n· Jueves 17:30\n· Sábado 11:00\n¿Cuál te acomoda?',
      },
      { kind: 'trace', clock: '23:47:04.6', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '2.5 s total' },
      { kind: 'in', time: '23:48', text: 'El jueves 5:30 porfa, a nombre de Mariana López' },
      { kind: 'trace', clock: '23:48:11.0', tool: 'Claude', text: 'Confirma: jueves 17:30 · Mariana López', dur: '0.8 s' },
      { kind: 'trace', clock: '23:48:11.4', tool: 'Google Calendar', text: 'Cita creada · limpieza · 45 min', dur: '0.3 s' },
      { kind: 'trace', clock: '23:48:11.6', tool: 'Google Sheets', text: 'Paciente registrada en tu base', dur: '0.2 s' },
      {
        kind: 'out',
        time: '23:48',
        text: 'Listo, Mariana. Te esperamos el jueves a las 17:30 para tu limpieza. Un día antes te mando un recordatorio por aquí.',
      },
      { kind: 'trace', clock: '23:48:12.9', tool: 'Recordatorio', text: 'Programado: miércoles 17:30 (24 h antes)' },
      { kind: 'trace', clock: '23:48:13.0', tool: 'Resumen', text: 'Cita agendada en 71 s. Nadie de tu equipo tuvo que contestar.' },
    ],
  },
  {
    id: 'consultorio',
    label: 'Consultorio',
    name: 'Consultorio médico',
    initials: 'CM',
    audience: 'paciente',
    flow: 'recepcion-virtual',
    caption: 'Demo de una recepción virtual para consultorio médico.',
    summary:
      'Un paciente conocido escribe un domingo a las 21:58. El sistema lo reconoce, ofrece horarios de la agenda del médico, agenda el seguimiento, guarda el motivo y programa la confirmación del día.',
    steps: [
      { kind: 'in', time: '21:58', text: 'Buenas noches, ¿el doctor tiene consulta mañana? Es para el seguimiento de mi presión.' },
      { kind: 'trace', clock: '21:58:40.3', tool: 'WhatsApp', text: 'Mensaje recibido · paciente registrado' },
      { kind: 'trace', clock: '21:58:41.1', tool: 'Claude', text: 'Reconoce a Jorge Medina · última consulta: 2 de septiembre', dur: '0.9 s' },
      { kind: 'trace', clock: '21:58:41.6', tool: 'Google Calendar', text: 'Agenda del médico · lunes → 2 horarios libres', dur: '0.4 s' },
      {
        kind: 'out',
        time: '21:58',
        text: 'Buenas noches, don Jorge. Mañana el doctor tiene espacio a las 9:30 o a las 12:00. ¿Cuál le queda mejor? Si tiene sus últimas tomas de presión, tráigalas por favor.',
      },
      { kind: 'trace', clock: '21:58:42.9', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '2.6 s total' },
      { kind: 'in', time: '21:59', text: 'A las 9:30 está perfecto, gracias' },
      { kind: 'trace', clock: '21:59:20.2', tool: 'Claude', text: 'Confirma: lunes 9:30 · seguimiento', dur: '0.7 s' },
      { kind: 'trace', clock: '21:59:20.5', tool: 'Google Calendar', text: 'Cita creada en la agenda del médico · 30 min', dur: '0.3 s' },
      { kind: 'trace', clock: '21:59:20.7', tool: 'Google Sheets', text: 'Motivo registrado: control de presión', dur: '0.2 s' },
      { kind: 'out', time: '21:59', text: 'Listo, don Jorge: mañana lunes a las 9:30. A las 8:00 le mando la confirmación por aquí.' },
      { kind: 'trace', clock: '21:59:22.0', tool: 'Recordatorio', text: 'Programado: lunes 8:00' },
      { kind: 'trace', clock: '21:59:22.1', tool: 'Resumen', text: 'Cita agendada un domingo en la noche. Nadie tuvo que contestar.' },
    ],
  },
  {
    id: 'inmobiliaria',
    label: 'Inmobiliaria',
    name: 'Inmobiliaria',
    initials: 'IN',
    audience: 'prospecto',
    flow: 'calificador-prospectos',
    caption: 'Demo de un calificador de prospectos para inmobiliaria.',
    summary:
      'Un prospecto pregunta por una casa del anuncio a las 22:05. El sistema le da los datos, pregunta presupuesto y fecha de mudanza, lo califica, agenda la visita con el asesor del inmueble y lo registra en el CRM.',
    steps: [
      { kind: 'in', time: '22:05', text: 'Hola, vi la casa en renta del anuncio, ¿sigue disponible?' },
      { kind: 'trace', clock: '22:05:18.4', tool: 'WhatsApp', text: 'Mensaje recibido · anuncio: casa en renta' },
      { kind: 'trace', clock: '22:05:19.4', tool: 'Claude', text: 'Intención: rentar · falta: presupuesto y fecha', dur: '1.0 s' },
      {
        kind: 'out',
        time: '22:05',
        text: '¡Hola! Sí sigue disponible: 3 recámaras, $14,500 al mes. Para ver si te acomoda, ¿cuál es tu presupuesto y para cuándo te quieres mudar?',
      },
      { kind: 'trace', clock: '22:05:20.5', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '2.1 s total' },
      { kind: 'in', time: '22:06', text: 'Hasta 15 mil, me mudaría el próximo mes. ¿Se puede ver el sábado?' },
      { kind: 'trace', clock: '22:06:02.8', tool: 'Claude', text: 'Califica: listo para visitar · presupuesto ok', dur: '0.9 s' },
      { kind: 'trace', clock: '22:06:03.2', tool: 'Google Calendar', text: 'Agenda del asesor del inmueble → sábado 11:00', dur: '0.4 s' },
      { kind: 'trace', clock: '22:06:03.5', tool: 'CRM', text: 'Prospecto registrado · fuente: anuncio', dur: '0.3 s' },
      {
        kind: 'out',
        time: '22:06',
        text: 'Perfecto. Te agendé el sábado a las 11:00 con Luis, el asesor de esa casa. Te mando la ubicación un día antes.',
      },
      { kind: 'trace', clock: '22:06:04.9', tool: 'Recordatorio', text: 'Ubicación programada: viernes 18:00' },
      { kind: 'trace', clock: '22:06:05.0', tool: 'Resumen', text: 'Prospecto calificado y visita agendada. El asesor solo llega a enseñar la casa.' },
    ],
  },
  {
    id: 'contable',
    label: 'Contable',
    name: 'Despacho contable',
    initials: 'DC',
    audience: 'cliente',
    flow: 'recepcion-documentos',
    caption: 'Demo de una recepción de documentos para despacho contable.',
    summary:
      'Un cliente manda sus facturas del mes a las 21:30. El sistema las clasifica, las archiva en la carpeta de septiembre, detecta qué falta, se lo pide y programa un recordatorio antes del día 17.',
    steps: [
      { kind: 'in', time: '21:30', text: 'Buenas noches, ahí van mis facturas de septiembre.', file: '3 archivos PDF' },
      { kind: 'trace', clock: '21:30:07.2', tool: 'WhatsApp', text: 'Recibidos 3 archivos · cliente registrado' },
      { kind: 'trace', clock: '21:30:08.8', tool: 'Claude', text: 'Clasifica: 2 facturas de ingreso · 1 de gasto', dur: '1.6 s' },
      { kind: 'trace', clock: '21:30:09.3', tool: 'Google Drive', text: 'Archivados en la carpeta de septiembre', dur: '0.5 s' },
      { kind: 'trace', clock: '21:30:09.5', tool: 'Google Sheets', text: 'Pendiente: estado de cuenta de septiembre', dur: '0.2 s' },
      {
        kind: 'out',
        time: '21:30',
        text: '¡Gracias! Recibimos 2 facturas de ingreso y 1 de gasto. Solo nos falta tu estado de cuenta de septiembre para preparar tu declaración.',
      },
      { kind: 'trace', clock: '21:30:10.3', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '3.1 s total' },
      { kind: 'in', time: '21:31', text: 'Ah sí, mañana se los mando' },
      { kind: 'trace', clock: '21:31:04.6', tool: 'Claude', text: 'Compromiso: estado de cuenta mañana', dur: '0.6 s' },
      { kind: 'out', time: '21:31', text: 'Perfecto. Si no lo vemos mañana, te lo recuerdo el día 15 para llegar a tiempo al 17.' },
      { kind: 'trace', clock: '21:31:05.8', tool: 'Recordatorio', text: 'Programado: día 15, 10:00' },
      { kind: 'trace', clock: '21:31:05.9', tool: 'Resumen', text: 'Documentos clasificados y archivados. Nadie del despacho los ordenó a mano.' },
    ],
  },
  {
    id: 'agencia',
    label: 'Agencia',
    name: 'Agencia de servicios',
    initials: 'AS',
    audience: 'prospecto',
    flow: 'propuestas',
    caption: 'Demo de un generador de propuestas para agencia de servicios.',
    summary:
      'Un prospecto pide cotización a las 20:40. El sistema pregunta lo que falta, redacta la propuesta con las plantillas y precios de la agencia, genera el PDF, la envía y registra la oportunidad.',
    steps: [
      { kind: 'in', time: '20:40', text: 'Hola, necesito página web para mi restaurante y manejo de redes. ¿Me pueden cotizar?' },
      { kind: 'trace', clock: '20:40:31.0', tool: 'WhatsApp', text: 'Mensaje recibido · prospecto nuevo' },
      { kind: 'trace', clock: '20:40:32.0', tool: 'Claude', text: 'Servicios: sitio web + redes · falta: volumen y presupuesto', dur: '1.0 s' },
      {
        kind: 'out',
        time: '20:40',
        text: '¡Claro! Para armarte la propuesta: ¿cuántas publicaciones al mes te gustaría y tienes un presupuesto aproximado?',
      },
      { kind: 'trace', clock: '20:40:33.2', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '2.2 s total' },
      { kind: 'in', time: '20:41', text: 'Unas 12 al mes, y unos 15 mil para arrancar' },
      { kind: 'trace', clock: '20:41:16.9', tool: 'Claude', text: 'Redacta propuesta con tus plantillas y precios', dur: '6.8 s' },
      { kind: 'trace', clock: '20:41:18.1', tool: 'PDF', text: 'Propuesta generada con tu marca · 4 páginas', dur: '1.2 s' },
      { kind: 'trace', clock: '20:41:18.3', tool: 'Google Sheets', text: 'Oportunidad en tu embudo · $15,000', dur: '0.2 s' },
      {
        kind: 'out',
        time: '20:41',
        text: 'Listo, aquí está tu propuesta con alcance, tiempos e inversión. Cualquier duda, la vemos por aquí.',
        file: 'Propuesta-restaurante.pdf',
      },
      { kind: 'trace', clock: '20:41:19.0', tool: 'Recordatorio', text: 'Seguimiento si no responde en 3 días' },
      { kind: 'trace', clock: '20:41:19.1', tool: 'Resumen', text: 'Propuesta enviada mientras el prospecto seguía en el chat.' },
    ],
  },
  {
    id: 'comercio',
    label: 'Comercio',
    name: 'Tienda',
    initials: 'TI',
    audience: 'cliente',
    flow: 'pedidos-posventa',
    caption: 'Demo de un sistema de pedidos y posventa para comercio.',
    summary:
      'Una clienta pregunta por un producto a las 22:40. El sistema consulta precio y existencias en el inventario, responde con el costo de envío, toma el pedido, actualiza el inventario y programa el seguimiento posventa.',
    steps: [
      { kind: 'in', time: '22:40', text: '¿Tienen los tenis blancos en talla 27? ¿Hacen envíos a Querétaro?' },
      { kind: 'trace', clock: '22:40:12.5', tool: 'WhatsApp', text: 'Mensaje recibido · clienta nueva' },
      { kind: 'trace', clock: '22:40:13.4', tool: 'Claude', text: 'Intención: compra · tenis blancos · talla 27', dur: '0.9 s' },
      { kind: 'trace', clock: '22:40:13.7', tool: 'Google Sheets', text: 'Inventario: 2 pares en talla 27 · $1,290', dur: '0.3 s' },
      {
        kind: 'out',
        time: '22:40',
        text: '¡Sí! Nos quedan 2 pares en talla 27, a $1,290. El envío a Querétaro cuesta $150 y llega en 2 a 3 días. ¿Te los aparto?',
      },
      { kind: 'trace', clock: '22:40:14.9', tool: 'WhatsApp', text: 'Respuesta enviada', dur: '2.4 s total' },
      { kind: 'in', time: '22:41', text: 'Sí porfa, a nombre de Daniela Ruiz' },
      { kind: 'trace', clock: '22:41:01.7', tool: 'Claude', text: 'Pedido: tenis blancos 27 · envío a Querétaro', dur: '0.7 s' },
      { kind: 'trace', clock: '22:41:02.0', tool: 'Google Sheets', text: 'Pedido registrado · inventario actualizado', dur: '0.3 s' },
      {
        kind: 'out',
        time: '22:41',
        text: 'Listo, Daniela. Te aparté tus tenis. Aquí va tu link de pago; en cuanto se acredite te mandamos tu guía.',
      },
      { kind: 'trace', clock: '22:41:03.2', tool: 'Recordatorio', text: 'Posventa: 3 días después de la entrega' },
      { kind: 'trace', clock: '22:41:03.3', tool: 'Resumen', text: 'Venta cerrada a las 22:41, con la tienda cerrada.' },
    ],
  },
]

const TYPING_MS = 1400
const LOOP_TAIL = 6400
const TICK = 100

function buildScript(steps: Step[]): { events: DemoEvent[]; end: number } {
  const events: DemoEvent[] = []
  let t = 0
  let prev: Step['kind'] | null = null
  for (const s of steps) {
    if (s.kind === 'in') {
      t = prev === null ? 0 : t + 1700
      events.push({ ...s, at: t })
    } else if (s.kind === 'out') {
      events.push({ at: t + 200, kind: 'typing', until: t + 200 + TYPING_MS })
      t += 200 + TYPING_MS
      events.push({ ...s, at: t })
    } else {
      t += prev === 'out' ? 300 : prev === 'in' ? 500 : 650
      events.push({ ...s, at: t })
    }
    prev = s.kind
  }
  return { events, end: t }
}

const BUILT = SCENARIOS.map((s) => buildScript(s.steps))

const TOOL_ICON: Record<Tool, typeof MessageCircle> = {
  WhatsApp: MessageCircle,
  Claude: Sparkles,
  'Google Calendar': CalendarDays,
  'Google Sheets': Table2,
  'Google Drive': FolderOpen,
  CRM: Users,
  PDF: FileText,
  Recordatorio: BellRing,
  Resumen: CircleCheckBig,
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function LiveDemo({ onTimeChange }: { onTimeChange?: (time: string) => void }) {
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const chips = useRef<(HTMLButtonElement | null)[]>([])
  const inView = useInView(rootRef, { margin: '-10% 0px' })
  const [index, setIndex] = useState(0)
  // Rota sola entre giros hasta que la persona elige uno.
  const [auto, setAuto] = useState(true)
  const [userPaused, setUserPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const [cycle, setCycle] = useState(0)

  const sc = SCENARIOS[index]
  const { events, end } = BUILT[index]
  const loop = end + LOOP_TAIL

  // La hora del titular sigue a la conversación que se está mostrando.
  useEffect(() => {
    const first = sc.steps[0]
    if (first.kind !== 'trace') onTimeChange?.(first.time)
  }, [sc, onTimeChange])

  function jumpTo(t: number) {
    elapsedRef.current = t
    setElapsed(t)
    setCycle((c) => c + 1)
  }

  // Con movimiento reducido arrancamos en el estado final y en pausa.
  useEffect(() => {
    if (reduce) {
      setUserPaused(true)
      setAuto(false)
      jumpTo(BUILT[0].end)
    }
  }, [reduce])

  const playing = !userPaused && inView

  useEffect(() => {
    if (!playing) return
    // Avanza con el reloj real (no por ticks) para no frenarse si el navegador espacia los timers.
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = Math.min(now - last, 1000)
      last = now
      if (document.hidden) return
      const next = elapsedRef.current + dt
      if (next >= loop) {
        if (auto) setIndex((i) => (i + 1) % SCENARIOS.length)
        jumpTo(0)
        return
      }
      elapsedRef.current = next
      setElapsed(next)
    }, TICK)
    return () => window.clearInterval(id)
  }, [playing, loop, auto])

  const chat = events.filter((e): e is ChatEvent => (e.kind === 'in' || e.kind === 'out') && e.at <= elapsed)
  const trace = events.filter((e): e is TraceEvent => e.kind === 'trace' && e.at <= elapsed)
  const typing = events.some((e) => e.kind === 'typing' && e.at <= elapsed && elapsed < e.until)
  const finished = elapsed >= end

  function choose(i: number) {
    setAuto(false)
    setIndex(i)
    if (reduce) {
      jumpTo(BUILT[i].end)
    } else {
      jumpTo(0)
      setUserPaused(false)
    }
  }

  function onChipsKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = SCENARIOS.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next !== null) {
      e.preventDefault()
      choose(next)
      chips.current[next]?.focus()
    }
  }

  function togglePlay() {
    if (userPaused && finished) jumpTo(0)
    setUserPaused((p) => !p)
  }

  return (
    <figure className="relative" aria-labelledby="demo-caption">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span id="demo-giros" className="mr-1 text-[0.85rem] text-muted">
          Ver demo de
        </span>
        <div
          role="radiogroup"
          aria-labelledby="demo-giros"
          onKeyDown={onChipsKey}
          className="flex flex-wrap gap-1.5"
        >
          {SCENARIOS.map((s, i) => {
            const selected = i === index
            return (
              <button
                key={s.id}
                ref={(el) => {
                  chips.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                className={`relative min-h-[40px] overflow-hidden rounded-full px-3.5 text-[0.85rem] font-semibold transition-colors duration-200 ${
                  selected ? 'bg-fg text-bg' : 'text-muted ring-1 ring-inset ring-line hover:text-fg hover:ring-faint'
                }`}
              >
                {s.label}
                {selected && auto && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1 h-[2px] origin-left rounded-full bg-bg/40"
                    style={{ transform: `scaleX(${Math.min(1, elapsed / loop)})` }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        ref={rootRef}
        className="relative flex flex-col gap-4 md:block md:h-[560px]"
        role="img"
        aria-label={`Demostración, ${sc.name}: ${sc.summary}`}
      >
        {/* Lo que pasa detrás */}
        <div className="relative overflow-hidden rounded-2xl bg-raised ring-1 ring-inset ring-line md:absolute md:right-0 md:top-0 md:h-[500px] md:w-[76%]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <p className="text-[0.8rem] font-semibold text-fg">Lo que pasa detrás</p>
            <p className="mono flex items-center gap-2 text-[0.72rem] text-muted">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${playing ? 'live-dot bg-teal-text' : 'bg-faint'}`}
              />
              {playing ? 'ejecutando' : finished ? 'completado' : 'en pausa'}
            </p>
          </div>
          <div className="mono truncate border-b border-line/70 px-4 py-2 text-[0.7rem] text-faint sm:px-5 md:pl-[35%]">
            flujo: {sc.flow} · {sc.name.toLowerCase()}
          </div>

          <ol
            key={`trace-${cycle}`}
            className="mono flex h-[330px] flex-col justify-end gap-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_48px)] px-3 pb-4 pt-2 text-[0.74rem] leading-snug sm:px-4 md:h-[calc(100%-82px)] md:pl-[35%]"
          >
            <AnimatePresence initial={false}>
              {trace.map((row, i) => {
                const Icon = TOOL_ICON[row.tool]
                const brand = brandForTool(row.tool)
                const latest = i === trace.length - 1
                const summary = row.tool === 'Resumen'
                return (
                  <motion.li
                    key={row.clock + row.tool}
                    layout="position"
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={`grid grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-lg px-2.5 py-2 transition-colors duration-700 ${
                      summary ? 'bg-teal-deep text-fg' : latest && !finished ? 'bg-sunken' : ''
                    }`}
                  >
                    {brand ? (
                      <BrandLogo brand={brand} className="mt-0.5 h-3.5 w-3.5 text-teal-text" />
                    ) : (
                      <Icon
                        aria-hidden="true"
                        className={`mt-0.5 h-3.5 w-3.5 ${summary ? 'text-fg' : 'text-teal-text'}`}
                        strokeWidth={2}
                      />
                    )}
                    <span className="min-w-0">
                      <span className="flex flex-wrap gap-x-2">
                        <span className="text-faint tabular">{row.clock}</span>
                        <span className={summary ? 'text-fg' : 'text-teal-text'}>{row.tool}</span>
                      </span>
                      <span className={`block ${summary ? 'font-semibold text-fg' : 'text-fg/90'}`}>{row.text}</span>
                    </span>
                    {row.dur ? <span className="tabular text-muted">{row.dur}</span> : <span />}
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ol>
        </div>

        {/* Lo que ve el cliente */}
        <div className="relative z-10 order-first rounded-[22px] bg-sunken shadow-[0_0_0_10px_theme(colors.bg)] md:absolute md:bottom-0 md:left-0 md:top-[64px] md:w-[46%]">
          <span className="absolute -top-3 left-4 z-10 rounded-full bg-fg px-3 py-1 text-[0.72rem] font-semibold text-bg">
            Lo que ve tu {sc.audience}
          </span>
          <div className="flex items-center gap-3 rounded-t-[22px] bg-[#10201f] px-4 pb-3 pt-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-deep text-[0.8rem] font-bold text-fg">
              {sc.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.92rem] font-semibold text-fg">{sc.name}</span>
              <span className="block text-[0.75rem] text-teal-text">{typing ? 'escribiendo…' : 'en línea'}</span>
            </span>
          </div>

          <ol
            key={`chat-${cycle}`}
            className="casual flex h-[380px] flex-col justify-end gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_40px)] rounded-b-[22px] px-3 pb-4 pt-3 md:h-[calc(100%-64px)]"
          >
            <AnimatePresence initial={false}>
              {chat.map((m) => (
                <motion.li
                  key={m.at}
                  layout="position"
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ transformOrigin: m.kind === 'in' ? 'bottom left' : 'bottom right' }}
                  className={`max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 pb-1.5 pt-2 text-[0.88rem] leading-[1.45] ${
                    m.kind === 'in'
                      ? 'self-start rounded-bl-md bg-[#1d3033] text-fg'
                      : 'self-end rounded-br-md bg-teal-deep text-fg'
                  }`}
                >
                  {m.file && (
                    <span className="mono mb-1.5 flex items-center gap-2 rounded-lg bg-bg/40 px-2.5 py-2 text-[0.72rem] text-fg">
                      <FileText aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-text" />
                      {m.file}
                    </span>
                  )}
                  {m.text}
                  <span className="mono mt-0.5 flex items-center justify-end gap-1 text-[0.62rem] text-fg/60">
                    {m.time}
                    {m.kind === 'out' && <CheckCheck aria-hidden="true" className="h-3 w-3 text-teal-text" />}
                  </span>
                </motion.li>
              ))}
              {typing && (
                <motion.li
                  key="typing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="flex gap-1 self-end rounded-2xl rounded-br-md bg-teal-deep px-3.5 py-3"
                  aria-hidden="true"
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-fg"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </motion.li>
              )}
            </AnimatePresence>
          </ol>
        </div>
      </div>

      <figcaption id="demo-caption" className="mt-4 flex items-start justify-between gap-4 text-[0.85rem] text-muted md:mt-3">
        <span className="max-w-[46ch]">
          {sc.caption} En tu negocio responde con tus horarios, precios y políticas.
        </span>
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-fg ring-1 ring-inset ring-line transition-colors hover:bg-raised"
          aria-label={userPaused ? 'Reproducir demostración' : 'Pausar demostración'}
        >
          {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="text-[0.85rem]">{userPaused ? 'Reproducir' : 'Pausar'}</span>
        </button>
      </figcaption>
    </figure>
  )
}
