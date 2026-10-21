import type { CSSProperties } from 'react'
import { ArrowDown, ArrowDownRight, ArrowRight, MapPin } from 'lucide-react'
import LiveDemo from './LiveDemo'
import Magnetic from './Magnetic'
import { useLeonTime } from '../hooks/useLeonTime'

// La entrada del hero va en CSS (.hero-word y .hero-fade en index.css): el HTML ya viene
// pintado del build y la animación corre desde el primer cuadro, sin esperar a React.
// `--d` es el retraso de cada pieza.
const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties

// El titular dice qué hace Cyclo. Cada palabra sube desde su propia máscara.
const HEADLINE = 'Automatizamos la atención de tu negocio por WhatsApp.'
const WORDS = HEADLINE.split(' ')
const ACCENT_FROM = WORDS.indexOf('por')

export default function Hero() {
  const leon = useLeonTime()

  return (
    <section id="inicio" className="relative pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      <div className="shell">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
          <h1 className="display text-fg lg:col-span-9">
            <span className="sr-only">{HEADLINE}</span>
            <span aria-hidden="true">
              {WORDS.map((word, i) => (
                <span key={i}>
                  <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                    <span
                      className={`hero-word ${i >= ACCENT_FROM ? 'text-teal-text' : ''}`}
                      style={delay(0.05 + i * 0.05)}
                    >
                      {word}
                    </span>
                  </span>
                  {i < WORDS.length - 1 ? ' ' : null}
                </span>
              ))}
            </span>
          </h1>

          <div className="hero-fade lg:col-span-3 lg:pb-3" style={delay(0.4)}>
            <p className="mono flex items-center gap-2 border-t border-line pt-4 text-[0.8rem] text-muted">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-teal-text" />
              León, Guanajuato · <span className="tabular text-fg">{leon}</span>
            </p>
            <a
              href="#agente"
              className="group mt-3 flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3 ring-1 ring-inset ring-line transition-colors hover:ring-faint"
            >
              <span>
                <span className="flex items-center gap-2 text-[0.92rem] font-semibold text-fg">
                  <span aria-hidden="true" className="live-dot h-2 w-2 rounded-full bg-teal-text" />
                  El agente está en línea
                </span>
                <span className="mt-0.5 block text-[0.84rem] text-muted">Pregúntale lo que quieras, ahora.</span>
              </span>
              <ArrowDownRight
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-teal-text transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="hero-fade lg:col-span-4 lg:pt-14" style={delay(0.2)}>
            <p className="lead max-w-[38ch]">
              Un sistema con inteligencia artificial contesta, agenda y da seguimiento por ti, a cualquier hora. Lo
              construimos y lo operamos desde León.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#contacto" className="btn-primary">
                  Agenda un diagnóstico gratis
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg">
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-fg" />
                  </span>
                </a>
              </Magnetic>
              <a href="#sistemas" className="btn-secondary">
                Ver sistemas por giro
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-6 text-[0.875rem] text-muted">30 minutos, sin costo.</p>
          </div>

          <div className="hero-fade hero-fade-far lg:col-span-8" style={delay(0.3)}>
            <LiveDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
