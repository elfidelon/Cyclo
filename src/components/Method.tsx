import Logo from './Logo'

const STAGES = [
  {
    name: 'Diagnóstico',
    when: 'Semana 1',
    body: 'Una sesión gratuita de 30 minutos. Si hay caso, mapeamos tu operación: qué se repite, cuánto tiempo cuesta y qué conviene automatizar primero.',
    deliverable: 'Mapa de procesos con horas y prioridades.',
  },
  {
    name: 'Diseño',
    when: 'Semanas 1 y 2',
    body: 'Definimos contigo qué contesta el sistema, qué pasa a una persona y con qué tono habla tu negocio.',
    deliverable: 'Guion de conversación y diagrama del flujo, aprobados por ti.',
  },
  {
    name: 'Construcción y pruebas',
    when: 'Semanas 2 y 3',
    body: 'Conectamos tu WhatsApp, tu calendario y tus hojas de cálculo, y lo probamos con casos reales antes de encenderlo.',
    deliverable: 'Sistema en pruebas y una sesión de capacitación con tu equipo.',
  },
  {
    name: 'Operación',
    when: 'Desde el encendido',
    body: 'Vigilamos cada ejecución, ajustamos respuestas y medimos resultados contra lo que estimamos en el diagnóstico.',
    deliverable: 'Reporte mensual: mensajes atendidos, citas y horas recuperadas.',
  },
]

const ROWS = [
  { process: 'Responder precios y horarios', times: 480, min: 3, priority: 'Alta' },
  { process: 'Agendar y confirmar citas', times: 240, min: 4, priority: 'Alta' },
  { process: 'Pasar datos a Excel', times: 180, min: 5, priority: 'Media' },
  { process: 'Recordatorios a pacientes', times: 240, min: 2, priority: 'Media' },
]

const fmt = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 })

function DiagnosticSheet() {
  const total = ROWS.reduce((s, r) => s + (r.times * r.min) / 60, 0)
  const automatable = 54
  return (
    <figure className="lg:sticky lg:top-28">
      <div className="rounded-xl bg-fg p-5 text-ink sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-ink/20 pb-4">
          <div>
            <p className="text-[0.78rem] font-semibold">Diagnóstico operacional</p>
            <p className="text-[1.35rem] font-bold leading-tight tracking-[-0.02em]">Clínica dental</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Logo className="h-5 w-5" stroke="#051214" strokeWidth={9} />
            <span className="text-[0.85rem] font-extrabold tracking-[-0.03em]">Cyclo</span>
          </div>
        </div>

        <div>
          <table className="mt-3 w-full text-left text-[0.85rem]">
            <caption className="sr-only">Horas al mes por proceso repetitivo</caption>
            <thead>
              <tr className="text-[0.72rem] text-ink-muted">
                <th scope="col" className="px-1 py-2 font-semibold">Proceso</th>
                <th scope="col" className="hidden px-1 py-2 text-right font-semibold sm:table-cell">Veces al mes</th>
                <th scope="col" className="hidden px-1 py-2 text-right font-semibold sm:table-cell">Min</th>
                <th scope="col" className="px-1 py-2 text-right font-semibold">Horas</th>
                <th scope="col" className="px-1 py-2 text-right font-semibold">Prioridad</th>
              </tr>
            </thead>
            <tbody className="mono tabular">
              {ROWS.map((r) => (
                <tr key={r.process} className="border-t border-ink/15">
                  <td className="py-2.5 pl-1 pr-2 [--mono:0]">{r.process}</td>
                  <td className="hidden px-1 py-2.5 text-right sm:table-cell">{r.times}</td>
                  <td className="hidden px-1 py-2.5 text-right sm:table-cell">{r.min}</td>
                  <td className="px-1 py-2.5 text-right">{fmt.format((r.times * r.min) / 60)}</td>
                  <td className="px-1 py-2.5 text-right [--mono:0]">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${r.priority === 'Alta' ? 'bg-ink' : 'ring-1 ring-inset ring-ink'}`}
                      />
                      {r.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="mono tabular">
              <tr className="border-t-2 border-ink">
                <th scope="row" className="py-2.5 pl-1 font-semibold [--mono:0]">
                  Total al mes
                </th>
                <td className="hidden sm:table-cell" />
                <td className="hidden sm:table-cell" />
                <td className="px-1 py-2.5 text-right font-bold">{fmt.format(total)} h</td>
                <td />
              </tr>
              <tr>
                <th scope="row" className="py-1 pl-1 font-semibold [--mono:0]">
                  Automatizable
                </th>
                <td className="hidden sm:table-cell" />
                <td className="hidden sm:table-cell" />
                <td className="px-1 py-1 text-right font-bold">{automatable} h</td>
                <td className="px-1 py-1 text-right text-ink-muted">{Math.round((automatable / total) * 100)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-5 rounded-lg bg-ink px-4 py-3 text-fg">
          <p className="text-[0.75rem] text-muted">Primer sistema recomendado</p>
          <p className="font-semibold">Agenda por WhatsApp · listo en 2 a 3 semanas</p>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.85rem] text-muted">
        Ejemplo con datos ilustrativos. El tuyo se hace con tu operación real.
      </figcaption>
    </figure>
  )
}

export default function Method() {
  return (
    <section id="metodo" aria-labelledby="metodo-titulo" className="py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2 id="metodo-titulo" className="heading text-fg">
            De la primera llamada a un sistema funcionando
          </h2>
          <p className="lead mt-5 max-w-[48ch]">
            Un proceso corto, con entregables claros en cada etapa. Tú apruebas antes de que algo toque a tus clientes.
          </p>

          <ol className="mt-12 flex flex-col">
            {STAGES.map((s, i) => (
              <li key={s.name} className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-line py-7 last:border-b">
                <span className="mono tabular text-[1.1rem] font-semibold text-teal-text" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[1.3rem] font-bold tracking-[-0.02em] text-fg">{s.name}</h3>
                    <p className="mono text-[0.78rem] text-faint">{s.when}</p>
                  </div>
                  <p className="mt-2 text-muted">{s.body}</p>
                  <p className="mt-3 text-[0.95rem] text-fg">
                    <span className="text-faint">Entregable: </span>
                    {s.deliverable}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-6 lg:pt-4">
          <DiagnosticSheet />
        </div>
      </div>
    </section>
  )
}
