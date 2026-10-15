import { useId, useMemo, useState, KeyboardEvent } from 'react'

// Patrón semanal (lun → dom) y una variación fija por día para que el mes se vea real
// sin cambiar en cada render. El mes empieza en lunes.
const WEEKDAY_VOLUME = [1.12, 1.05, 1, 1.02, 1.1, 0.82, 0.55]
const WEEKDAY_AFTER_HOURS = [0.9, 0.85, 0.85, 0.9, 1, 1.45, 1.9]
const JITTER = [
  0.96, 1.04, 0.98, 1.07, 0.93, 1.02, 0.97, 1.05, 0.95, 1.01, 1.08, 0.94, 1.03, 0.99, 1.06, 0.92, 1, 1.04, 0.97,
  1.02, 0.95, 1.07, 0.98, 1.03, 0.96, 1.05, 0.94, 1.01, 0.99, 1.06,
]
const DAY_NAMES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

type Day = { day: number; name: string; total: number; waiting: number; answered: number }

function buildMonth(perDay: number, afterHoursPct: number): Day[] {
  return JITTER.map((j, i) => {
    const w = i % 7
    const total = Math.max(1, Math.round(perDay * WEEKDAY_VOLUME[w] * j))
    const share = Math.min(1, (afterHoursPct / 100) * WEEKDAY_AFTER_HOURS[w])
    const waiting = Math.round(total * share)
    return { day: i + 1, name: DAY_NAMES[w], total, waiting, answered: total - waiting }
  })
}

const nf = new Intl.NumberFormat('es-MX')

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-semibold text-fg">
          {label}
        </label>
        <output htmlFor={id} className="mono tabular shrink-0 text-[1.05rem] text-fg">
          {value}
          <span className="text-muted">{unit}</span>
        </output>
      </div>
      {hint && <p className="mt-0.5 text-[0.875rem] text-muted">{hint}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
        style={{ ['--fill' as string]: `${fill}%` }}
      />
    </div>
  )
}

export default function CostCalculator() {
  const [perDay, setPerDay] = useState(40)
  const [afterHours, setAfterHours] = useState(35)
  const [minutes, setMinutes] = useState(3)
  const [withCyclo, setWithCyclo] = useState(false)
  const [active, setActive] = useState<number | null>(null)

  const month = useMemo(() => buildMonth(perDay, afterHours), [perDay, afterHours])
  const total = month.reduce((s, d) => s + d.total, 0)
  const waiting = month.reduce((s, d) => s + d.waiting, 0)
  const hours = Math.round((total * minutes) / 60)
  const max = Math.max(...month.map((d) => d.total))
  const yTop = Math.max(10, Math.ceil(max / 10) * 10)

  const topLabel = withCyclo ? 'Contestados por Cyclo, en segundos' : 'Esperando respuesta'
  const topColor = withCyclo ? 'bg-series-cyclo' : 'bg-series-wait'

  function onChartKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setActive((a) => {
        const cur = a ?? (e.key === 'ArrowRight' ? -1 : month.length)
        return Math.min(month.length - 1, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)))
      })
    } else if (e.key === 'Home') {
      setActive(0)
    } else if (e.key === 'End') {
      setActive(month.length - 1)
    } else if (e.key === 'Escape') {
      setActive(null)
    }
  }

  const activeDay = active !== null ? month[active] : null

  return (
    <section id="costo" aria-labelledby="costo-titulo" className="py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="costo-titulo" className="heading text-fg">
            ¿Cuántos mensajes se te quedan esperando?
          </h2>
          <p className="lead mt-5 max-w-[44ch]">
            Ajusta los números a tu negocio. Es una estimación rápida; en el diagnóstico la medimos con tus datos reales.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            <Slider label="Mensajes que recibes al día" value={perDay} min={5} max={200} step={5} unit="" onChange={setPerDay} />
            <Slider
              label="Llegan cuando nadie puede contestar"
              hint="Fuera de horario, en consulta, en una junta o en fin de semana."
              value={afterHours}
              min={5}
              max={80}
              step={5}
              unit="%"
              onChange={setAfterHours}
            />
            <Slider
              label="Minutos para contestar cada uno"
              value={minutes}
              min={1}
              max={10}
              step={1}
              unit=" min"
              onChange={setMinutes}
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-raised p-5 ring-1 ring-inset ring-line sm:p-8">
            <div role="radiogroup" aria-label="Comparar" className="inline-flex rounded-full bg-bg p-1 ring-1 ring-inset ring-line">
              {[
                { v: false, label: 'Sin Cyclo' },
                { v: true, label: 'Con Cyclo' },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={withCyclo === o.v}
                  onClick={() => setWithCyclo(o.v)}
                  className={`min-h-[40px] rounded-full px-5 text-[0.92rem] font-semibold transition-colors duration-200 ${
                    withCyclo === o.v ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <dl className="mt-7 grid gap-6 sm:grid-cols-2" aria-live="polite">
              <div>
                <dt className="flex items-center gap-2 text-[0.92rem] text-muted">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-[3px] ${topColor}`} />
                  {withCyclo ? 'Mensajes que esperan respuesta' : 'Mensajes al mes que esperan horas'}
                </dt>
                <dd className="mt-1 text-[clamp(2.4rem,1.6rem+2.4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-fg">
                  {withCyclo ? '0' : nf.format(waiting)}
                </dd>
                <dd className="mt-2 text-[0.92rem] text-muted">
                  {withCyclo
                    ? `Los ${nf.format(waiting)} reciben respuesta en segundos, a cualquier hora.`
                    : `De ${nf.format(total)} que recibes. Muchos le escriben a otro mientras tanto.`}
                </dd>
              </div>
              <div>
                <dt className="text-[0.92rem] text-muted">
                  {withCyclo ? 'Horas que tu equipo puede dedicar a otra cosa' : 'Horas al mes de tu equipo contestando'}
                </dt>
                <dd className="mt-1 text-[clamp(2.4rem,1.6rem+2.4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-fg">
                  {withCyclo ? 'Hasta ' : ''}
                  {nf.format(hours)} h
                </dd>
                <dd className="mt-2 text-[0.92rem] text-muted">
                  {withCyclo
                    ? 'Tu equipo solo atiende lo que de verdad necesita a una persona.'
                    : 'Casi siempre respondiendo las mismas preguntas.'}
                </dd>
              </div>
            </dl>

            <div className="mt-9 border-t border-line pt-6">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <p className="text-[0.92rem] font-semibold text-fg">Tu mes, día por día</p>
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.82rem] text-muted" aria-label="Leyenda">
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-series-team" />
                    Contestados por tu equipo
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-[3px] ${topColor}`} />
                    {topLabel}
                  </li>
                </ul>
              </div>

              <div className="relative mt-5">
                {/* Escala */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[168px]">
                  {[1, 0.5, 0].map((f) => (
                    <div
                      key={f}
                      className="absolute inset-x-0 flex items-center gap-2"
                      style={{ top: `${(1 - f) * 100}%`, transform: 'translateY(-50%)' }}
                    >
                      <span className="mono tabular w-7 text-right text-[0.68rem] text-faint">
                        {Math.round(yTop * f)}
                      </span>
                      <span className="h-px flex-1 bg-line/70" />
                    </div>
                  ))}
                </div>

                <div
                  tabIndex={0}
                  role="group"
                  aria-label={`Mensajes por día durante 30 días: ${nf.format(total)} en total, ${nf.format(waiting)} ${
                    withCyclo ? 'contestados por Cyclo' : 'esperando respuesta'
                  }. Usa las flechas para recorrer los días.`}
                  onKeyDown={onChartKey}
                  onMouseLeave={() => setActive(null)}
                  onBlur={() => setActive(null)}
                  className="relative ml-9 flex h-[168px] items-end rounded-md"
                >
                  {month.map((d, i) => (
                    <div
                      key={d.day}
                      onMouseEnter={() => setActive(i)}
                      className="flex h-full flex-1 cursor-default items-end justify-center"
                    >
                      <div
                        className={`flex w-full max-w-[12px] flex-col justify-end gap-[2px] transition-opacity duration-200 ${
                          active !== null && active !== i ? 'opacity-40' : 'opacity-100'
                        }`}
                        style={{ height: `${(d.total / yTop) * 100}%` }}
                      >
                        <div
                          className={`rounded-t-[4px] transition-[height,background-color] duration-500 ease-out-expo ${topColor}`}
                          style={{ height: `${(d.waiting / d.total) * 100}%` }}
                        />
                        <div className="flex-1 bg-series-team" />
                      </div>
                    </div>
                  ))}

                  {activeDay && (
                    <div
                      role="status"
                      className="pointer-events-none absolute -top-3 z-10 w-max -translate-x-1/2 -translate-y-full rounded-lg bg-bg px-3 py-2 text-[0.8rem] text-fg ring-1 ring-inset ring-line"
                      style={{
                        left: `clamp(70px, ${((active! + 0.5) / month.length) * 100}%, calc(100% - 70px))`,
                      }}
                    >
                      <p className="font-semibold">
                        Día {activeDay.day} · {activeDay.name}
                      </p>
                      <p className="mono tabular text-muted">
                        {activeDay.total} mensajes · {activeDay.waiting} {withCyclo ? 'por Cyclo' : 'esperando'}
                      </p>
                    </div>
                  )}
                </div>
                <div aria-hidden="true" className="mono tabular ml-9 mt-2 flex justify-between text-[0.68rem] text-faint">
                  <span>día 1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>

              <details className="group mt-5">
                <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-md text-[0.88rem] text-muted transition-colors hover:text-fg">
                  <span className="transition-transform group-open:rotate-90" aria-hidden="true">
                    ›
                  </span>
                  Ver los datos como tabla
                </summary>
                <div className="mt-2 max-h-64 overflow-auto rounded-lg ring-1 ring-inset ring-line">
                  <table className="mono tabular w-full text-left text-[0.78rem]">
                    <caption className="sr-only">Mensajes por día</caption>
                    <thead className="sticky top-0 bg-raised text-muted">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-normal">Día</th>
                        <th scope="col" className="px-3 py-2 text-right font-normal">Total</th>
                        <th scope="col" className="px-3 py-2 text-right font-normal">Tu equipo</th>
                        <th scope="col" className="px-3 py-2 text-right font-normal">
                          {withCyclo ? 'Cyclo' : 'Esperando'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {month.map((d) => (
                        <tr key={d.day} className="border-t border-line/60">
                          <td className="px-3 py-1.5 text-muted">
                            {d.day} {d.name}
                          </td>
                          <td className="px-3 py-1.5 text-right">{d.total}</td>
                          <td className="px-3 py-1.5 text-right">{d.answered}</td>
                          <td className="px-3 py-1.5 text-right">{d.waiting}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
