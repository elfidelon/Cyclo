import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import LiveDemo from './LiveDemo'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Line({ children, delay, className = '' }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function Clock({ time }: { time: string }) {
  return (
    <span className="mono relative inline-flex overflow-hidden align-bottom font-bold tracking-[-0.04em]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={time}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-block"
        >
          {time}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Hero() {
  const [time, setTime] = useState('23:47')
  return (
    <section id="inicio" className="relative pb-20 pt-28 sm:pt-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-16">
      <div className="shell grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h1 className="display text-fg">
            <Line delay={0.1}>
              Son las <Clock time={time} />.
            </Line>
            <Line delay={0.2}>Tu negocio cerró.</Line>
            <Line delay={0.3} className="text-teal-text">
              Tu WhatsApp, no.
            </Line>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            <p className="lead mt-7 max-w-[44ch]">
              Cyclo construye sistemas con inteligencia artificial que atienden por ti a cualquier hora: contestan
              mensajes, agendan citas, califican prospectos y dan seguimiento. Conectados a tu WhatsApp, tu Google
              Calendar y tus hojas de cálculo.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#contacto" className="btn-primary">
                Agenda un diagnóstico gratis
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg">
                  <ArrowRight className="h-4 w-4 text-fg" />
                </span>
              </a>
              <a href="#sistemas" className="btn-secondary">
                Ver sistemas por giro
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-6 text-[0.875rem] text-faint">30 minutos, sin costo. Te decimos con números si te conviene.</p>
          </motion.div>
        </div>

        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        >
          <LiveDemo onTimeChange={setTime} />
        </motion.div>
      </div>
    </section>
  )
}
