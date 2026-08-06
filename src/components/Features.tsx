import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Check, ClipboardList, GitBranch, MessageSquare, Share2 } from 'lucide-react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import Logo from './Logo'

const CARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function useCardAnim(index: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return {
    ref,
    initial: { scale: 0.95, opacity: 0 },
    animate: inView ? { scale: 1, opacity: 1 } : {},
    transition: { duration: 0.7, delay: index * 0.15, ease: CARD_EASE },
  }
}

function ChecklistCard({
  index,
  number,
  title,
  icon,
  items,
  accent = false,
}: {
  index: number
  number: string
  title: string
  icon: React.ReactNode
  items: string[]
  accent?: boolean
}) {
  const anim = useCardAnim(index)
  return (
    <motion.div
      ref={anim.ref}
      initial={anim.initial}
      animate={anim.animate}
      transition={anim.transition}
      className="relative rounded-2xl p-6 sm:p-7 flex flex-col overflow-hidden min-h-[280px] lg:min-h-0"
      style={
        accent
          ? { background: 'radial-gradient(120% 100% at 20% 100%, rgba(0,137,152,0.35) 0%, rgba(0,0,0,0) 55%), #0a1012' }
          : { background: '#212121' }
      }
    >
      {accent && (
        <Logo className="absolute -right-[20%] -bottom-[20%] w-[80%] h-[80%] opacity-[0.12] pointer-events-none" stroke="#DEDBC8" />
      )}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/40 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="relative text-primary text-lg sm:text-xl font-medium mb-5">
        {title} <span className="text-gray-500 font-normal">({number})</span>
      </h3>
      <ul className="relative flex flex-col gap-3 mb-6 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-gray-400 text-sm">{item}</span>
          </li>
        ))}
      </ul>
      <a href="#contacto" className="relative inline-flex items-center gap-1.5 text-primary text-sm w-fit">
        Saber más
        <ArrowRight className="w-3.5 h-3.5" style={{ transform: 'rotate(-45deg)' }} />
      </a>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="servicios" className="relative min-h-screen bg-black py-20 sm:py-28 px-4 sm:px-6 scroll-mt-6">
      <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto mb-12 sm:mb-16 text-center">
        <WordsPullUpMultiStyle
          containerClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight"
          segments={[
            { text: 'Sistemas de nivel productivo para negocios que quieren crecer.', className: 'text-primary' },
            { text: 'Diseñados para operar solos. Impulsados por IA.', className: 'text-gray-500' },
          ]}
        />
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:h-[480px] gap-3 sm:gap-2 md:gap-1">
        <ChecklistCard
          index={0}
          number="00"
          title="Gestión de redes sociales"
          icon={<Share2 className="w-5 h-5" />}
          accent
          items={[
            'Calendario de contenido y diseño de posts',
            'Programación y publicación automática',
            'Reportes de alcance y engagement',
          ]}
        />

        <ChecklistCard
          index={1}
          number="01"
          title="Diagnóstico operacional"
          icon={<ClipboardList className="w-5 h-5" />}
          items={[
            'Mapeo completo de tus procesos actuales',
            'Cuantificación del tiempo y costo perdido',
            'Plan de automatización con ROI estimado',
            'Prioridades claras antes de invertir',
          ]}
        />

        <ChecklistCard
          index={2}
          number="02"
          title="Flujos autónomos"
          icon={<GitBranch className="w-5 h-5" />}
          items={[
            'Recibe y procesa información con IA',
            'Toma decisiones sin intervención humana',
            'Se integra a las herramientas que ya usas',
          ]}
        />

        <ChecklistCard
          index={3}
          number="03"
          title="Agentes de conversación"
          icon={<MessageSquare className="w-5 h-5" />}
          items={[
            'Atiende y califica leads 24/7',
            'Responde por WhatsApp y email en segundos',
            'Escala a demanda sin costos por volumen',
          ]}
        />
      </div>
    </section>
  )
}
