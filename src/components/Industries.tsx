import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Landmark, ShoppingBag, Smile, Stethoscope, Users } from 'lucide-react'

const INDUSTRIES = [
  { icon: Smile, label: 'Clínicas dentales', desc: 'Agenda, recordatorios y seguimiento de pacientes por WhatsApp.' },
  { icon: Building2, label: 'Inmobiliarias', desc: 'Calificación de leads, visitas agendadas y CRM sincronizado.' },
  { icon: Stethoscope, label: 'Consultorios médicos', desc: 'Confirmación de citas y triage inicial automatizado.' },
  { icon: Landmark, label: 'Despachos contables', desc: 'Clasificación de documentos y recordatorios fiscales.' },
  { icon: ShoppingBag, label: 'Comercios y retail', desc: 'Atención de pedidos y soporte post-venta con IA.' },
  { icon: Users, label: 'Agencias de servicios', desc: 'Seguimiento de propuestas y gestión de clientes.' },
]

export default function Industries() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="industrias" className="bg-black py-20 sm:py-28 px-4 sm:px-6 scroll-mt-6">
      <div className="max-w-6xl mx-auto text-center mb-12 sm:mb-16">
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4">
          Con quién trabajamos
        </p>
        <h2 className="text-primary text-2xl sm:text-3xl md:text-4xl font-normal max-w-2xl mx-auto leading-tight">
          Negocios de servicio que dependen de responder rápido.
        </h2>
      </div>

      <div ref={ref} className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INDUSTRIES.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#101010] rounded-2xl p-6 flex flex-col gap-3"
          >
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-primary font-medium">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
