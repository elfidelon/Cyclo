import { motion } from 'framer-motion'
import { ArrowRight, Volume2 } from 'lucide-react'
import { DEMOS, Demo, ScriptItem } from '../demo/data'
import GiroIcon from '../demo/GiroIcon'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Msg = Extract<ScriptItem, { kind: 'msg' }>

// Las demos se abren en la misma pestaña para que la flecha de "atrás" del navegador
// regrese aquí. Antes de salir dejamos #demos en la dirección: si el navegador no
// recuerda el scroll, al volver cae en esta sección.
function rememberSection() {
  if (window.location.hash !== '#demos') window.history.replaceState(null, '', '#demos')
}

// Cada tarjeta: ícono y nombre del giro bien visibles, y el primer mensaje tal cual llega.
// La grande enseña los tres primeros mensajes de la conversación.
function DemoCard({ demo, big, i }: { demo: Demo; big?: boolean; i: number }) {
  const msgs = demo.script.filter((s): s is Msg => s.kind === 'msg').slice(0, big ? 3 : 1)
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: EASE }}
      className={big ? 'sm:col-span-2 lg:row-span-2' : ''}
    >
      <a
        href={`demos/${demo.slug}.html`}
        onClick={rememberSection}
        style={{ background: `color-mix(in srgb, ${demo.theme.brand} 9%, #0c1a1c)` }}
        className="group flex h-full min-h-[220px] flex-col rounded-2xl p-5 ring-1 ring-inset ring-line transition-transform duration-300 ease-out-expo hover:-translate-y-1 focus-visible:-translate-y-1 sm:p-6"
      >
        <span className="flex items-center gap-3.5">
          <span
            className={`flex shrink-0 items-center justify-center rounded-xl ${big ? 'h-14 w-14' : 'h-12 w-12'}`}
            style={{ background: demo.theme.brand, color: demo.theme.ink }}
          >
            <GiroIcon slug={demo.slug} className={big ? 'h-7 w-7' : 'h-6 w-6'} />
          </span>
          <span className="min-w-0">
            <span
              className={`block font-bold leading-tight tracking-[-0.02em] text-fg ${
                big ? 'text-[clamp(1.6rem,1.2rem+1.2vw,2.1rem)]' : 'text-[1.3rem]'
              }`}
            >
              {demo.giro}
            </span>
            <span className="mt-0.5 block truncate text-[0.88rem] text-muted">{demo.business}</span>
          </span>
        </span>

        <span className="mt-6 flex flex-col gap-2">
          {msgs.map((m, k) => {
            const mine = m.from === 'cliente'
            return (
              <span
                key={k}
                className={`chat-font block max-w-[88%] whitespace-pre-line rounded-[12px] px-3 py-2 leading-snug text-[#111b21] ${
                  mine ? 'self-end rounded-tr-[3px] bg-[#d9fdd3]' : 'self-start rounded-tl-[3px] bg-white'
                } ${big ? 'text-[1rem] sm:text-[1.05rem]' : 'text-[0.92rem]'} ${k > 0 ? 'hidden lg:block' : ''}`}
              >
                {m.text}
                <span className="ml-2 text-[0.7rem] text-[#667781]">{m.time}</span>
              </span>
            )
          })}
        </span>

        <span className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="flex items-center gap-2 text-[0.92rem] font-semibold text-fg">
            <Volume2 aria-hidden="true" className="h-4 w-4 text-muted" />
            Ver demo
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </span>
      </a>
    </motion.li>
  )
}

export default function Demos() {
  return (
    <section id="demos" aria-labelledby="demos-titulo" className="py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 id="demos-titulo" className="heading text-fg">
              Mira una demo de tu giro
            </h2>
            <p className="lead mt-5 max-w-[52ch]">Menos de un minuto cada una, con sonido.</p>
          </div>
          <p className="text-[0.88rem] text-muted md:text-right">Negocios y datos de ejemplo</p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMOS.map((d, i) => (
            <DemoCard key={d.slug} demo={d} big={i === 0} i={i} />
          ))}
          <motion.li
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="sm:col-span-2"
          >
            <a
              href="#contacto"
              className="group flex h-full min-h-[180px] flex-col justify-between rounded-2xl bg-raised p-5 ring-1 ring-inset ring-line transition-colors hover:bg-sunken sm:p-6"
            >
              <span className="text-[0.95rem] font-bold text-muted">¿No ves tu giro?</span>
              <span className="mt-6 block">
                <span className="block text-[1.5rem] font-extrabold leading-tight tracking-[-0.025em] text-fg">
                  Te armamos la demo con tu negocio
                </span>
                <span className="mt-3 flex items-center gap-2 text-[0.92rem] font-semibold text-teal-text">
                  Pídela en el diagnóstico
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </span>
            </a>
          </motion.li>
        </ul>
      </div>
    </section>
  )
}
