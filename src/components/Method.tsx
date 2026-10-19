import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileCheck, KeyRound, Lock, Receipt, ShieldCheck } from 'lucide-react'
import BrandLogo, { BRAND_COLORS } from './BrandLogo'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STAGES = [
  { name: 'Diagnóstico', when: 'Semana 1', body: '30 minutos, gratis. Sales con un mapa de qué automatizar primero.' },
  { name: 'Diseño', when: 'Semanas 1 y 2', body: 'Apruebas qué contesta el sistema y qué pasa a una persona.' },
  { name: 'Construcción y pruebas', when: 'Semanas 2 y 3', body: 'Lo conectamos a tus herramientas y lo probamos con casos reales.' },
  { name: 'Operación', when: 'Desde el encendido', body: 'Lo vigilamos, lo ajustamos y cada mes te mandamos un reporte.' },
]

const iconClass = 'h-5 w-5'

// Lo formal (factura, precio) y lo que protege los datos. Cada punto describe cómo está
// hecho el sistema; nada de sellos ni certificaciones que no tenemos.
const GUARANTEES: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <Receipt aria-hidden="true" className={iconClass} />, title: 'Facturamos', body: 'Factura electrónica (CFDI) por cada pago.' },
  { icon: <FileCheck aria-hidden="true" className={iconClass} />, title: 'Precio cerrado', body: 'Cotización por escrito antes de empezar. Sin cobros sorpresa.' },
  {
    icon: <KeyRound aria-hidden="true" className={iconClass} />,
    title: 'Tus datos son tuyos',
    body: 'Viven en tus cuentas de Google. Nos quitas el acceso cuando quieras.',
  },
  {
    icon: <Lock aria-hidden="true" className={iconClass} />,
    title: 'Todo cifrado',
    body: 'Las conexiones van por HTTPS y las contraseñas de tus cuentas se guardan cifradas.',
  },
  {
    icon: <BrandLogo brand="whatsapp" color={BRAND_COLORS.whatsapp} className={iconClass} />,
    title: 'WhatsApp oficial',
    body: 'API de WhatsApp Business de Meta. Nada de apps no oficiales que ponen en riesgo tu número.',
  },
  {
    icon: <BrandLogo brand="claude" color={BRAND_COLORS.claude} className={iconClass} />,
    title: 'La IA no aprende de tus clientes',
    body: 'Usamos Claude por su API comercial: Anthropic no entrena sus modelos con esas conversaciones.',
  },
]

export default function Method() {
  return (
    <section id="metodo" aria-labelledby="metodo-titulo" className="py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="metodo-titulo" className="heading max-w-[16ch] text-fg">
            Así trabajamos
          </h2>
          <p className="lead max-w-[44ch] lg:text-right">Tú apruebas cada paso antes de que algo toque a tus clientes.</p>
        </div>

        <ol className="relative mt-12 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden="true" className="absolute left-0 right-0 top-4 hidden h-px bg-line lg:block">
            <motion.span
              className="block h-full origin-left bg-teal-text"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, ease: EASE }}
            />
          </span>
          {STAGES.map((s, i) => (
            <motion.li
              key={s.name}
              className="relative"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: EASE }}
            >
              <span
                aria-hidden="true"
                className="tabular relative flex h-8 w-8 items-center justify-center rounded-full bg-bg text-[0.95rem] font-semibold text-teal-text ring-1 ring-inset ring-teal-text/60"
              >
                {i + 1}
              </span>
              <h3 className="mt-5 text-[1.25rem] font-bold leading-tight tracking-[-0.02em] text-fg">{s.name}</h3>
              <p className="mt-1 text-[0.85rem] font-semibold text-teal-text">{s.when}</p>
              <p className="mt-2 max-w-[32ch] text-muted">{s.body}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-16 rounded-2xl bg-raised p-6 ring-1 ring-inset ring-line sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2.5 text-[1.35rem] font-bold tracking-[-0.02em] text-fg">
              <ShieldCheck aria-hidden="true" className="h-6 w-6 text-teal-text" />
              Formal y seguro
            </h3>
            <p className="text-muted">Lo que firmas y cómo cuidamos tu información.</p>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {GUARANTEES.map((g) => (
              <li key={g.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sunken text-teal-text">{g.icon}</span>
                <span>
                  <span className="block text-[1.05rem] font-semibold leading-snug text-fg">{g.title}</span>
                  <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{g.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
