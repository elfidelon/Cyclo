const NAV_ITEMS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Industrias', href: '#industrias' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
      <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
        {NAV_ITEMS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="text-[10px] sm:text-xs md:text-sm transition-colors whitespace-nowrap"
              style={{ color: 'rgba(225, 224, 204, 0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
