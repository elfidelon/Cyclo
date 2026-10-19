import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useLeonTime } from '../hooks/useLeonTime'
import { lockScroll } from '../lib/smooth'

const NAV_ITEMS = [
  { label: 'Cuánto ahorras', href: '#costo' },
  { label: 'Sistemas', href: '#sistemas' },
  { label: 'Demos', href: '#demos' },
  { label: 'El agente', href: '#agente' },
  { label: 'Cómo funciona', href: '#detras' },
  { label: 'Método', href: '#metodo' },
]

// Incluye secciones fuera del menú para que el resaltado se apague al llegar a ellas.
const SECTION_IDS = ['inicio', 'costo', 'sistemas', 'demos', 'agente', 'detras', 'metodo', 'preguntas', 'contacto']

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}

export default function Navbar() {
  const reduce = useReducedMotion()
  const time = useLeonTime()
  const active = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  // Se esconde al bajar y vuelve al subir: deja ver el contenido sin perder el menú.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) < 6) return
      setHidden(y > 240 && y > last)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    firstLink.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const showBar = !hidden || open || focusInside

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-nav px-3 pt-3 sm:px-4 sm:pt-4">
      <motion.nav
        aria-label="Principal"
        initial={reduce ? false : { y: -80, opacity: 0 }}
        animate={{ y: showBar ? 0 : -96, opacity: showBar ? 1 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        onFocus={() => setFocusInside(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusInside(false)
        }}
        className="pointer-events-auto relative z-[1] mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-3 rounded-full bg-raised/95 pl-4 pr-1.5 shadow-[0_2px_8px_rgb(0_0_0/0.3)] ring-1 ring-inset ring-line"
      >
        <a href="#inicio" className="flex items-center gap-2.5 rounded-full" aria-label="Cyclo, ir al inicio">
          <Logo className="h-7 w-7" draw />
          <span className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-fg">Cyclo</span>
        </a>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = active === href.slice(1)
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[0.92rem] transition-colors duration-200 hover:text-fg ${
                    isActive ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3.5 bottom-0.5 h-px origin-left bg-teal-text transition-transform duration-300 ease-out-expo ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <p className="mono mr-2 hidden items-center gap-2 text-[0.78rem] text-muted xl:flex">
            <span aria-hidden="true" className="live-dot h-1.5 w-1.5 rounded-full bg-teal-text" />
            León <span className="tabular text-fg">{time}</span>
          </p>
          <a
            href="#contacto"
            className="group hidden min-h-[44px] items-center gap-2 rounded-full bg-fg px-5 text-[0.92rem] font-semibold text-bg transition-colors hover:bg-white sm:inline-flex"
          >
            Agenda tu diagnóstico
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <button
            ref={menuButton}
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.92rem] font-semibold text-fg ring-1 ring-inset ring-line lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto fixed inset-0 flex flex-col bg-bg px-5 pb-8 pt-24 lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map(({ label, href }, i) => (
                <motion.li
                  key={href}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 + i * 0.05, ease: EASE }}
                >
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[64px] items-center justify-between border-b border-line text-[clamp(1.9rem,1.2rem+3vw,2.6rem)] font-bold tracking-[-0.025em] text-fg"
                  >
                    {label}
                    <ArrowRight aria-hidden="true" className="h-6 w-6 text-teal-text" />
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-5">
              <p className="mono flex items-center gap-2 text-[0.85rem] text-muted">
                <span aria-hidden="true" className="live-dot h-1.5 w-1.5 rounded-full bg-teal-text" />
                En León son las <span className="tabular text-fg">{time}</span>
              </p>
              <a href="#contacto" onClick={() => setOpen(false)} className="btn-primary w-fit">
                Agenda tu diagnóstico
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg">
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-fg" />
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
