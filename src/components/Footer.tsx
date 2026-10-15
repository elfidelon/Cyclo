import Logo from './Logo'

const LINKS = [
  { label: 'Cuánto te cuesta', href: '#costo' },
  { label: 'Sistemas por giro', href: '#sistemas' },
  { label: 'Cómo funciona', href: '#detras' },
  { label: 'Método', href: '#metodo' },
  { label: 'Preguntas', href: '#preguntas' },
]

export default function Footer() {
  return (
    <footer className="py-14">
      <div className="shell flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <a href="#inicio" className="flex w-fit items-center gap-2.5 rounded-md" aria-label="Cyclo, volver al inicio">
            <Logo className="h-7 w-7" />
            <span className="text-[1.3rem] font-extrabold tracking-[-0.03em] text-fg">Cyclo</span>
          </a>
          <p className="mt-4 text-muted">
            Sistemas con inteligencia artificial que atienden, agendan y dan seguimiento por tu negocio.
          </p>
        </div>

        <nav aria-label="Secciones" className="grid grid-cols-2 gap-x-12 gap-y-1 sm:grid-cols-3 md:grid-cols-2">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="flex min-h-[40px] items-center text-muted transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-1 text-muted">
          <a href="https://wa.me/524776191070" target="_blank" rel="noreferrer" className="flex min-h-[40px] items-center hover:text-fg">
            WhatsApp · +52 477 619 1070
          </a>
          <a href="mailto:hola@cyclo.mx" className="flex min-h-[40px] items-center hover:text-fg">
            hola@cyclo.mx
          </a>
        </div>
      </div>

      <div className="shell mt-12">
        <p className="border-t border-line pt-6 text-[0.85rem] text-faint">© 2026 Cyclo · Ciudad de México</p>
      </div>
    </footer>
  )
}
