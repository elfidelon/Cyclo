import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from './Logo'

const NAV_ITEMS = [
  { label: 'Sistemas', href: '#sistemas' },
  { label: 'Cómo funciona', href: '#detras' },
  { label: 'Método', href: '#metodo' },
  { label: 'Preguntas', href: '#preguntas' },
]

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

// Incluye secciones fuera del menú para que el resaltado se apague al llegar a ellas.
const SECTION_IDS = ['inicio', 'costo', 'sistemas', 'detras', 'metodo', 'preguntas', 'contacto']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-nav transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? 'bg-bg shadow-[0_1px_0_0_theme(colors.line)]' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Principal" className="shell flex h-16 items-center justify-between gap-6 sm:h-[72px]">
        <a href="#inicio" className="flex items-center gap-2.5 rounded-md" aria-label="Cyclo, ir al inicio">
          <Logo className="h-7 w-7" draw />
          <span className="text-[1.3rem] font-extrabold tracking-[-0.03em] text-fg">Cyclo</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = active === href.slice(1)
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-[0.95rem] transition-colors duration-200 hover:text-fg ${
                    isActive ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-teal-text transition-transform duration-300 ease-out-expo ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#contacto"
            className="group hidden min-h-[44px] items-center gap-2 rounded-full bg-fg px-5 text-[0.95rem] font-semibold text-bg transition-colors hover:bg-white sm:inline-flex"
          >
            Agenda tu diagnóstico
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-fg ring-1 ring-inset ring-line lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 top-16 z-menu border-t border-line bg-bg sm:top-[72px] lg:hidden"
      >
        <ul className="shell flex flex-col py-3">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-[52px] items-center border-b border-line/60 text-lg text-fg"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <a href="#contacto" onClick={() => setOpen(false)} className="btn-primary">
              Agenda tu diagnóstico
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg">
                <ArrowRight className="h-4 w-4 text-fg" />
              </span>
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
