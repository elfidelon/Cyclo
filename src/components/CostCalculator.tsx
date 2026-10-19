import { useId, useState } from 'react'
import { motion } from 'framer-motion'

// Un solo dato del visitante (mensajes al día) y la diferencia al instante. Los supuestos
// van escritos debajo; en el diagnóstico se cambian por los datos reales del negocio.
const MIN_PER_MSG = 3
const AFTER_HOURS = 0.35
const TO_A_PERSON = 0.1
const DAYS = 30

const nf = new Intl.NumberFormat('es-MX')
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Row({
  label,
  value,
  pct,
  tone,
  note,
}: {
  label: string
  value: string
  pct: number
  tone: 'sin' | 'con'
  note?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[7.5rem_1fr] sm:items-center sm:gap-4">
      <span className={`text-[0.95rem] font-semibold ${tone === 'con' ? 'text-teal-text' : 'text-muted'}`}>{label}</span>
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative h-9 flex-1 overflow-hidden rounded-lg bg-bg" aria-hidden="true">
          <motion.span
            className={`absolute inset-y-0 left-0 rounded-lg ${tone === 'con' ? 'bg-series-cyclo' : 'bg-series-wait'}`}
            initial={false}
            animate={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </span>
        <span className="tabular w-[5.5rem] shrink-0 text-right text-[1.35rem] font-bold leading-none tracking-[-0.02em] text-fg sm:w-[6.5rem] sm:text-[1.6rem]">
          {value}
        </span>
      </span>
      {note && <span className="text-[0.85rem] text-muted sm:col-start-2 sm:-mt-2">{note}</span>}
    </div>
  )
}

export default function CostCalculator() {
  const id = useId()
  const [perDay, setPerDay] = useState(40)

  const total = perDay * DAYS
  const hoursSin = Math.round((total * MIN_PER_MSG) / 60)
  const hoursCon = Math.round((total * TO_A_PERSON * MIN_PER_MSG) / 60)
  const waitingSin = Math.round(total * AFTER_HOURS)
  const saved = hoursSin - hoursCon
  const fill = ((perDay - 5) / (200 - 5)) * 100

  return (
    <section id="costo" aria-labelledby="costo-titulo" className="py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="costo-titulo" className="heading text-fg">
            ¿Cuántas horas se te van en WhatsApp?
          </h2>
          <p className="lead mt-5 max-w-[40ch]">Mueve la barra y mira la diferencia.</p>

          <div className="mt-10 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line">
            <label htmlFor={id} className="block font-semibold text-fg">
              Mensajes de clientes al día
            </label>
            <output htmlFor={id} className="tabular mt-1 block text-[3rem] font-bold leading-none tracking-[-0.03em] text-fg">
              {perDay}
            </output>
            <input
              id={id}
              type="range"
              min={5}
              max={200}
              step={5}
              value={perDay}
              onChange={(e) => setPerDay(Number(e.target.value))}
              className="mt-5 w-full"
              style={{ ['--fill' as string]: `${fill}%` }}
            />
            <p className="mt-3 text-[0.9rem] text-muted">{nf.format(total)} mensajes al mes</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8" aria-live="polite">
            <h3 className="text-[1.1rem] font-bold text-fg">Horas de tu equipo contestando, al mes</h3>
            <div className="mt-5 flex flex-col gap-4">
              <Row label="Sin Cyclo" value={`${nf.format(hoursSin)} h`} pct={100} tone="sin" />
              <Row
                label="Con Cyclo"
                value={`${nf.format(hoursCon)} h`}
                pct={(hoursCon / Math.max(1, hoursSin)) * 100}
                tone="con"
                note="Solo los casos que necesitan a una persona."
              />
            </div>

            <h3 className="mt-9 text-[1.1rem] font-bold text-fg">Mensajes que esperan horas, al mes</h3>
            <div className="mt-5 flex flex-col gap-4">
              <Row label="Sin Cyclo" value={nf.format(waitingSin)} pct={100} tone="sin" note="Llegan de noche o con el equipo ocupado." />
              <Row label="Con Cyclo" value="0" pct={0} tone="con" note="Se contestan en segundos, a cualquier hora." />
            </div>

            <div className="mt-9 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-xl bg-teal-deep px-5 py-4">
              <p className="text-[1.05rem] font-semibold text-fg">Recuperas</p>
              <p className="tabular text-[clamp(2.2rem,1.6rem+2vw,3rem)] font-bold leading-none tracking-[-0.03em] text-fg">
                {nf.format(saved)} h al mes
              </p>
            </div>
          </div>
          <p className="mt-4 text-[0.85rem] text-muted">
            Estimado con {MIN_PER_MSG} min por mensaje, {AFTER_HOURS * 100}% fuera de horario y 1 de cada 10 pasando a una persona. En
            el diagnóstico lo medimos con tus datos.
          </p>
        </div>
      </div>
    </section>
  )
}
