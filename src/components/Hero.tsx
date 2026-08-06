import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from './Navbar'
import WordsPullUp from './WordsPullUp'
import Logo from './Logo'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Hero() {
  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#0a1012]">
        {/* Cinematic background: gradient + oversized spiral mark (no external assets) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 100%, rgba(0,137,152,0.22) 0%, rgba(10,16,18,0) 55%), radial-gradient(80% 60% at 80% 0%, rgba(0,137,152,0.12) 0%, rgba(0,0,0,0) 60%), #060a0b',
          }}
        />
        <Logo
          className="absolute -right-[15%] -top-[10%] w-[70%] h-[70%] opacity-[0.10] pointer-events-none"
          stroke="#DEDBC8"
        />
        <div className="noise-overlay absolute inset-0 opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <Navbar />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-12 md:col-span-8">
              <h1
                className="text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em]"
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text="Cyclo" showAsterisk />
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col gap-5 sm:gap-6 pb-2 md:pb-4">
              <motion.p
                className="text-primary/70 text-xs sm:text-sm md:text-base"
                style={{ lineHeight: 1.2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              >
                ¿Quieres más tiempo libre para ti o para tu negocio? Cyclo te lo da: automatizamos
                las tareas repetitivas con inteligencia artificial para que recuperes horas cada
                semana.
              </motion.p>
              <motion.a
                href="#contacto"
                className="group inline-flex items-center gap-2 hover:gap-3 transition-[gap] bg-primary rounded-full pl-5 pr-1.5 py-1.5 w-fit"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
              >
                <span className="text-black font-medium text-sm sm:text-base">
                  Agendar una sesión
                </span>
                <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-110">
                  <ArrowRight className="w-4 h-4 text-[#E1E0CC]" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
