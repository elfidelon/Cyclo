import { useRef, useState, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'
import BrandLogo, { Brand, BRAND_COLORS, BRAND_NAMES, BRAND_URLS, brandForTool } from './BrandLogo'

type Step = { tool: string; action: string }
type System = {
  id: string
  giro: string
  name: string
  solves: string
  trigger: { channel: string; example: string }
  steps: Step[]
  brands: Brand[]
  extra?: string
  timeline: string
}

const SYSTEMS: System[] = [
  {
    id: 'dental',
    giro: 'Clínica dental',
    name: 'Agenda por WhatsApp',
    solves: 'Pacientes que escriben de noche y nadie contesta. Citas que se olvidan.',
    trigger: { channel: 'WhatsApp', example: '“¿Tienen espacio para una limpieza esta semana?”' },
    steps: [
      { tool: 'Claude', action: 'Entiende si es cita, precio o urgencia.' },
      { tool: 'Google Calendar', action: 'Ofrece tres horarios libres.' },
      { tool: 'Google Sheets', action: 'Registra al paciente.' },
      { tool: 'Recordatorio', action: 'Avisa 24 h y 2 h antes.' },
    ],
    brands: ['whatsapp', 'googlecalendar', 'googlesheets'],
    timeline: '2 a 3 semanas',
  },
  {
    id: 'consultorio',
    giro: 'Consultorio médico',
    name: 'Recepción virtual',
    solves: 'La recepción pasa el día contestando lo mismo y confirmando citas.',
    trigger: { channel: 'WhatsApp', example: '“¿El doctor tiene consulta el lunes?”' },
    steps: [
      { tool: 'Claude', action: 'Reconoce al paciente y detecta urgencias.' },
      { tool: 'Google Calendar', action: 'Agenda con el médico que corresponde.' },
      { tool: 'Google Sheets', action: 'Guarda el motivo de consulta.' },
      { tool: 'Recordatorio', action: 'Confirma a las 8:00 del día.' },
    ],
    brands: ['whatsapp', 'googlecalendar', 'googlesheets'],
    timeline: '2 a 3 semanas',
  },
  {
    id: 'inmobiliaria',
    giro: 'Inmobiliaria',
    name: 'Calificador de prospectos',
    solves: 'Decenas de mensajes por anuncio, y los buenos prospectos se enfrían.',
    trigger: { channel: 'WhatsApp', example: '“Vi la casa del anuncio, ¿sigue disponible?”' },
    steps: [
      { tool: 'Claude', action: 'Pregunta presupuesto, zona y fecha, y califica.' },
      { tool: 'Google Calendar', action: 'Agenda la visita con el asesor.' },
      { tool: 'CRM', action: 'Registra de qué anuncio llegó.' },
      { tool: 'WhatsApp', action: 'Da seguimiento a las 48 h.' },
    ],
    brands: ['whatsapp', 'googlecalendar', 'googlesheets'],
    extra: 'o tu CRM',
    timeline: '3 a 4 semanas',
  },
  {
    id: 'contable',
    giro: 'Despacho contable',
    name: 'Recepción de documentos',
    solves: 'Facturas que llegan por todos lados y a destiempo.',
    trigger: { channel: 'Formulario', example: 'El cliente sube sus documentos del mes.' },
    steps: [
      { tool: 'Claude', action: 'Clasifica cada archivo.' },
      { tool: 'Google Drive', action: 'Lo archiva por cliente y mes.' },
      { tool: 'Gmail', action: 'Confirma qué recibió y qué falta.' },
      { tool: 'Recordatorio', action: 'Avisa antes del día 17.' },
    ],
    brands: ['gmail', 'googledrive', 'googlesheets'],
    timeline: '2 a 3 semanas',
  },
  {
    id: 'escuela',
    giro: 'Escuela privada',
    name: 'Inscripciones y cobranza',
    solves: 'En inscripciones, el WhatsApp de la escuela se llena de las mismas preguntas.',
    trigger: { channel: 'WhatsApp', example: '“¿Todavía hay lugar en primero de primaria?”' },
    steps: [
      { tool: 'Claude', action: 'Contesta costos, requisitos y fechas.' },
      { tool: 'Google Calendar', action: 'Agenda visitas guiadas.' },
      { tool: 'Google Sheets', action: 'Registra a cada familia interesada.' },
      { tool: 'Recordatorio', action: 'Avisa antes de que venza la colegiatura.' },
    ],
    brands: ['whatsapp', 'googlecalendar', 'googlesheets'],
    timeline: '2 a 3 semanas',
  },
  {
    id: 'agencia',
    giro: 'Agencia de servicios',
    name: 'Propuestas en minutos',
    solves: 'Cada propuesta tarda días, y el cliente cotiza con otros mientras tanto.',
    trigger: { channel: 'Formulario', example: 'El prospecto describe su proyecto y su presupuesto.' },
    steps: [
      { tool: 'Claude', action: 'Redacta con tus plantillas y precios.' },
      { tool: 'PDF', action: 'Genera la propuesta con tu marca.' },
      { tool: 'Gmail + WhatsApp', action: 'La envía y te avisa.' },
      { tool: 'Recordatorio', action: 'Da seguimiento a los 3 días.' },
    ],
    brands: ['gmail', 'whatsapp', 'googlesheets'],
    timeline: '2 a 3 semanas',
  },
  {
    id: 'comercio',
    giro: 'Comercio',
    name: 'Pedidos y posventa',
    solves: 'Preguntas de precio y envíos que se acumulan mientras atiendes el mostrador.',
    trigger: { channel: 'WhatsApp', example: '“¿Tienen la talla 27? ¿Envían a Querétaro?”' },
    steps: [
      { tool: 'Google Sheets', action: 'Consulta precio y existencias.' },
      { tool: 'WhatsApp', action: 'Responde y toma el pedido.' },
      { tool: 'Tu equipo', action: 'Recibe las quejas y los casos especiales.' },
      { tool: 'Recordatorio', action: 'Pregunta cómo le fue a los 3 días.' },
    ],
    brands: ['whatsapp', 'googlesheets'],
    extra: 'o tu inventario',
    timeline: '2 a 4 semanas',
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Systems() {
  const [index, setIndex] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const sys = SYSTEMS[index]

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = SYSTEMS.length - 1
    let next: number | null = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next !== null) {
      e.preventDefault()
      setIndex(next)
      tabs.current[next]?.focus()
    }
  }

  return (
    <section id="sistemas" aria-labelledby="sistemas-titulo" className="py-24 sm:py-32">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="sistemas-titulo" className="heading text-fg">
            Un sistema para cada forma de atender
          </h2>
          <p className="lead mt-5 max-w-[52ch]">Se arma con los horarios, precios y forma de trabajar de tu giro.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div
            role="tablist"
            aria-label="Giros"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="flex flex-wrap gap-2 lg:col-span-4 lg:flex-col lg:gap-0"
          >
            {SYSTEMS.map((s, i) => {
              const selected = i === index
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  id={`tab-${s.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setIndex(i)}
                  className={`group text-left transition-colors duration-200 max-lg:min-h-[44px] max-lg:rounded-full max-lg:px-4 max-lg:text-[0.95rem] lg:block lg:border-t lg:border-line lg:py-4 lg:last:border-b ${
                    selected
                      ? 'max-lg:bg-fg max-lg:font-semibold max-lg:text-bg lg:text-fg'
                      : 'text-muted max-lg:ring-1 max-lg:ring-inset max-lg:ring-line hover:text-fg'
                  }`}
                >
                  <span className="lg:block lg:text-[1.3rem] lg:font-bold lg:leading-tight lg:tracking-[-0.02em]">{s.giro}</span>
                  <span
                    className={`mt-1 hidden text-[0.88rem] lg:block ${selected ? 'text-teal-text' : 'text-faint group-hover:text-muted'}`}
                  >
                    {s.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sys.id}
                id={`panel-${sys.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${sys.id}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
                transition={{ duration: 0.32, ease: EASE }}
                className="grid gap-8 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8 md:grid-cols-[1.4fr_1fr] md:gap-10"
              >
                <div>
                  <p className="text-[0.9rem] text-muted">{sys.giro}</p>
                  <h3 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-fg">{sys.name}</h3>
                  <p className="mt-3 text-muted">{sys.solves}</p>

                  <ol className="relative mt-8" aria-label="Pasos del sistema">
                    <span aria-hidden="true" className="absolute bottom-6 left-[7px] top-3 w-px bg-line" />
                    <li className="relative pb-5 pl-8">
                      <span aria-hidden="true" className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full bg-fg ring-4 ring-raised" />
                      <span className="mono text-[0.75rem] text-muted">Entra por {sys.trigger.channel}</span>
                      <span className="casual mt-0.5 block text-fg">{sys.trigger.example}</span>
                    </li>
                    {sys.steps.map((st, i) => {
                      const brand = brandForTool(st.tool)
                      return (
                        <motion.li
                          key={i}
                          className="relative pb-5 pl-8"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: 0.06 + i * 0.045, ease: EASE }}
                        >
                          <span
                            aria-hidden="true"
                            className="absolute left-[3px] top-2 h-[9px] w-[9px] rounded-full bg-teal-text ring-4 ring-raised"
                          />
                          <span className="mono flex items-center gap-1.5 text-[0.75rem] text-teal-text">
                            {brand && <BrandLogo brand={brand} className="h-3 w-3" />}
                            {st.tool}
                          </span>
                          <span className="mt-0.5 block text-fg/90">{st.action}</span>
                        </motion.li>
                      )
                    })}
                    <li className="relative flex items-center gap-2 pl-8 text-[0.88rem] text-muted">
                      <RotateCcw aria-hidden="true" className="absolute left-0 h-[15px] w-[15px] text-muted" />
                      Y vuelve a empezar con el siguiente mensaje.
                    </li>
                  </ol>
                </div>

                <dl className="flex flex-col gap-7 border-line max-md:border-t max-md:pt-6 md:border-l md:pl-8">
                  <div>
                    <dt className="text-[0.85rem] text-muted">Se conecta con</dt>
                    <dd className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
                      {sys.brands.map((b) => (
                        <a
                          key={b}
                          href={BRAND_URLS[b]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[32px] items-center gap-2 text-[0.92rem] text-fg underline-offset-4 hover:underline"
                        >
                          <BrandLogo brand={b} color={BRAND_COLORS[b]} className="h-5 w-5" />
                          {BRAND_NAMES[b]}
                          <span className="sr-only">(abre su sitio en otra pestaña)</span>
                        </a>
                      ))}
                      {sys.extra && <span className="text-[0.92rem] text-muted">{sys.extra}</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.85rem] text-muted">Listo en</dt>
                    <dd className="mt-1 text-[1.5rem] font-bold tracking-[-0.02em] text-fg">{sys.timeline}</dd>
                    <dd className="text-[0.88rem] text-muted">desde el diagnóstico</dd>
                  </div>
                  <div className="mt-auto flex flex-col items-start gap-1">
                    <a
                      href={`demos/${sys.id}.html`}
                      onClick={() => {
                        if (window.location.hash !== '#sistemas') window.history.replaceState(null, '', '#sistemas')
                      }}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-fg px-5 text-[0.95rem] font-semibold text-bg transition-colors hover:bg-white"
                    >
                      Ver la demo
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                    <a
                      href="#contacto"
                      className="inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-teal-text underline-offset-4 hover:underline"
                    >
                      Quiero este sistema
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
