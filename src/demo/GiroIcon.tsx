import { Calculator, GraduationCap, House, Megaphone, ShoppingBag, Stethoscope } from 'lucide-react'

// Ícono del giro de cada demo. Lucide no trae muela, así que la dental va dibujada con
// el mismo trazo (24 × 24, línea de 2).
function Tooth({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 3C5 3 3 5 3 7.6c0 2.4 1.1 3.7 1.7 5.7.6 2 .8 4.4 1.6 6.4.4 1 1 1.5 1.7 1.5 1.2 0 1.6-1.4 1.9-3 .3-1.5.6-3 2.1-3s1.8 1.5 2.1 3c.3 1.6.7 3 1.9 3 .7 0 1.3-.5 1.7-1.5.8-2 1-4.4 1.6-6.4.6-2 1.7-3.3 1.7-5.7C21 5 19 3 16.5 3c-1.9 0-2.6 1-4.5 1S9.4 3 7.5 3Z" />
    </svg>
  )
}

const ICONS = {
  consultorio: Stethoscope,
  inmobiliaria: House,
  contable: Calculator,
  escuela: GraduationCap,
  agencia: Megaphone,
  comercio: ShoppingBag,
} as const

export default function GiroIcon({ slug, className = 'h-5 w-5' }: { slug: string; className?: string }) {
  if (slug === 'dental') return <Tooth className={className} />
  const Icon = ICONS[slug as keyof typeof ICONS]
  return Icon ? <Icon aria-hidden="true" className={className} /> : null
}
