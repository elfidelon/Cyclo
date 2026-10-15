import { useRef, useState, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

type Step = { tool: string; action: string }
type System = {
  id: string
  giro: string
  name: string
  solves: string
  trigger: { channel: string; example: string }
  steps: Step[]
  connects: string
  timeline: string
  measures: string
}

const SYSTEMS: System[] = [
  {
    id: 'dental',
    giro: 'Clínica dental',
    name: 'Agenda por WhatsApp',
    solves: 'Pacientes que escriben de noche o en fin de semana y nadie les contesta. Citas que se olvidan y huecos que se quedan vacíos.',
    trigger: { channel: 'WhatsApp', example: '“¿Tienen espacio para una limpieza esta semana?”' },
    steps: [
      { tool: 'Claude', action: 'Entiende qué necesita: una cita, un precio, una urgencia o una duda.' },
      { tool: 'Google Calendar', action: 'Busca horarios libres reales y ofrece tres opciones.' },
      { tool: 'WhatsApp', action: 'Confirma la cita con nombre, tratamiento y hora.' },
      { tool: 'Google Sheets', action: 'Registra al paciente y el motivo de la visita.' },
      { tool: 'Recordatorio', action: 'Avisa 24 h y 2 h antes. Si cancela, libera el espacio.' },
    ],
    connects: 'WhatsApp Business, Google Calendar, Google Sheets',
    timeline: '2 a 3 semanas',
    measures: 'Citas agendadas fuera de horario, inasistencias y tiempo de respuesta.',
  },
  {
    id: 'consultorio',
    giro: 'Consultorio médico',
    name: 'Recepción virtual',
    solves: 'La recepción pasa el día contestando lo mismo y confirmando citas por teléfono, mientras la sala de espera se llena.',
    trigger: { channel: 'WhatsApp', example: '“Buenos días, ¿el doctor tiene consulta el lunes?”' },
    steps: [
      { tool: 'Claude', action: 'Reconoce si el paciente ya había escrito y retoma la conversación donde quedó.' },
      { tool: 'Claude', action: 'Hace las preguntas previas que tú definas. Si detecta una urgencia, avisa a una persona.' },
      { tool: 'Google Calendar', action: 'Agenda en la agenda del médico que corresponde.' },
      { tool: 'Google Sheets', action: 'Guarda los datos de contacto y el motivo de consulta.' },
      { tool: 'Recordatorio', action: 'Manda la confirmación a las 8:00 del día de la cita.' },
    ],
    connects: 'WhatsApp Business, Google Calendar, Google Sheets',
    timeline: '2 a 3 semanas',
    measures: 'Citas confirmadas, llamadas que ya no hace la recepción y urgencias canalizadas.',
  },
  {
    id: 'inmobiliaria',
    giro: 'Inmobiliaria',
    name: 'Calificador de prospectos',
    solves: 'Cada anuncio trae decenas de mensajes y los asesores no saben a quién atender primero. Los buenos prospectos se enfrían.',
    trigger: { channel: 'WhatsApp', example: '“Vi la casa del anuncio, ¿sigue disponible?”' },
    steps: [
      { tool: 'Claude', action: 'Pregunta presupuesto, zona, forma de pago y fecha de mudanza, como lo haría un asesor.' },
      { tool: 'Claude', action: 'Califica: listo para visitar, explorando o fuera de perfil.' },
      { tool: 'Google Calendar', action: 'Agenda la visita con el asesor que lleva ese inmueble.' },
      { tool: 'CRM', action: 'Registra al prospecto con su calificación y el anuncio de donde llegó.' },
      { tool: 'WhatsApp', action: 'Da seguimiento a quien no respondió en 48 horas.' },
    ],
    connects: 'WhatsApp Business, Google Calendar, Google Sheets o tu CRM',
    timeline: '3 a 4 semanas',
    measures: 'Prospectos calificados, visitas agendadas y tiempo hasta el primer contacto.',
  },
  {
    id: 'contable',
    giro: 'Despacho contable',
    name: 'Recepción de documentos',
    solves: 'Clientes que mandan facturas y estados de cuenta por correo, por WhatsApp y a destiempo. Alguien del despacho tiene que ordenarlos a mano.',
    trigger: { channel: 'Formulario', example: 'El cliente sube sus documentos del mes.' },
    steps: [
      { tool: 'Claude', action: 'Lee cada archivo y lo clasifica: factura, estado de cuenta, constancia u otro.' },
      { tool: 'Google Drive', action: 'Lo archiva en la carpeta del cliente y del mes.' },
      { tool: 'Gmail', action: 'Le confirma al cliente qué recibió y qué le falta.' },
      { tool: 'Recordatorio', action: 'Avisa antes del día 17 a quien todavía no manda lo de su declaración.' },
      { tool: 'Google Sheets', action: 'Actualiza el tablero de pendientes por cliente.' },
    ],
    connects: 'Formulario web, Gmail, Google Drive, Google Sheets',
    timeline: '2 a 3 semanas',
    measures: 'Documentos recibidos a tiempo, horas de captura y pendientes por cliente.',
  },
  {
    id: 'agencia',
    giro: 'Agencia de servicios',
    name: 'Propuestas en minutos',
    solves: 'Cada propuesta comercial se arma a mano y tarda días en salir. Para cuando llega, el cliente ya cotizó con otros.',
    trigger: { channel: 'Formulario', example: 'El prospecto describe su proyecto y su presupuesto.' },
    steps: [
      { tool: 'Claude', action: 'Redacta la propuesta con alcance, tiempos e inversión, a partir de tus plantillas y precios.' },
      { tool: 'PDF', action: 'Genera el documento con tu marca.' },
      { tool: 'Gmail + WhatsApp', action: 'Lo envía al prospecto y te avisa a ti.' },
      { tool: 'Google Sheets', action: 'Registra la oportunidad en tu embudo de ventas.' },
      { tool: 'Recordatorio', action: 'Da seguimiento si no hay respuesta en tres días.' },
    ],
    connects: 'Formulario web, Gmail, WhatsApp Business, Google Sheets',
    timeline: '2 a 3 semanas',
    measures: 'Tiempo para enviar una propuesta, propuestas enviadas y tasa de cierre.',
  },
  {
    id: 'comercio',
    giro: 'Comercio',
    name: 'Pedidos y posventa',
    solves: 'Preguntas de precio, existencias y envíos que se acumulan en el WhatsApp de la tienda mientras atiendes el mostrador.',
    trigger: { channel: 'WhatsApp', example: '“¿Tienen la talla 27 en negro? ¿Hacen envíos a Querétaro?”' },
    steps: [
      { tool: 'Claude', action: 'Identifica si es una pregunta, un pedido o una queja.' },
      { tool: 'Google Sheets', action: 'Consulta precio y existencias en tu inventario.' },
      { tool: 'WhatsApp', action: 'Responde con el dato exacto y toma el pedido.' },
      { tool: 'Tu equipo', action: 'Las quejas y los casos especiales pasan a una persona, con toda la conversación.' },
      { tool: 'Recordatorio', action: 'Tres días después de la entrega, pregunta cómo le fue.' },
    ],
    connects: 'WhatsApp Business, Google Sheets o tu sistema de inventario',
    timeline: '2 a 4 semanas',
    measures: 'Pedidos por WhatsApp, tiempo de respuesta y quejas resueltas.',
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
          <p className="lead mt-5 max-w-[58ch]">
            No es un chatbot genérico. Cada sistema se diseña alrededor de cómo trabaja tu giro y se ajusta a tus
            horarios, precios y políticas.
          </p>
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
                className="grid gap-8 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8 md:grid-cols-[1.35fr_1fr] md:gap-10"
              >
                <div>
                  <p className="text-[0.9rem] text-muted">{sys.giro}</p>
                  <h3 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-fg">{sys.name}</h3>
                  <p className="mt-3 text-muted">{sys.solves}</p>

                  <ol className="relative mt-8" aria-label="Pasos del sistema">
                    <span aria-hidden="true" className="absolute bottom-6 left-[7px] top-3 w-px bg-line" />
                    <li className="relative pb-5 pl-8">
                      <span aria-hidden="true" className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full bg-fg ring-4 ring-raised" />
                      <span className="mono text-[0.75rem] text-faint">Entra por {sys.trigger.channel}</span>
                      <span className="casual mt-0.5 block text-fg">{sys.trigger.example}</span>
                    </li>
                    {sys.steps.map((st, i) => (
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
                        <span className="mono text-[0.75rem] text-teal-text">{st.tool}</span>
                        <span className="mt-0.5 block text-fg/90">{st.action}</span>
                      </motion.li>
                    ))}
                    <li className="relative flex items-center gap-2 pl-8 text-[0.88rem] text-faint">
                      <RotateCcw aria-hidden="true" className="absolute left-0 h-[15px] w-[15px] text-faint" />
                      Y vuelve a empezar con el siguiente mensaje.
                    </li>
                  </ol>
                </div>

                <dl className="flex flex-col gap-6 border-line max-md:border-t max-md:pt-6 md:border-l md:pl-8">
                  <div>
                    <dt className="text-[0.85rem] text-faint">Se conecta con</dt>
                    <dd className="mt-1 text-fg">{sys.connects}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.85rem] text-faint">Listo en</dt>
                    <dd className="mt-1 text-[1.5rem] font-bold tracking-[-0.02em] text-fg">{sys.timeline}</dd>
                    <dd className="text-[0.88rem] text-muted">desde el diagnóstico</dd>
                  </div>
                  <div>
                    <dt className="text-[0.85rem] text-faint">Lo que medimos cada mes</dt>
                    <dd className="mt-1 text-fg">{sys.measures}</dd>
                  </div>
                  <a
                    href="#contacto"
                    className="mt-auto inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-teal-text underline-offset-4 hover:underline"
                  >
                    Quiero este sistema
                    <span aria-hidden="true">→</span>
                  </a>
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
