import { Mail, MessageCircle } from 'lucide-react'
import ContactForm from './ContactForm'

const NEXT = [
  'Te escribimos en menos de 24 horas.',
  'Agendamos la sesión de diagnóstico de 30 minutos.',
  'Si hay caso, te mandamos una propuesta cerrada y por escrito.',
]

export default function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="bg-teal-drench py-24 text-ink sm:py-28">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="contacto-titulo" className="heading">
            Empieza con 30 minutos.
          </h2>
          <p className="mt-5 max-w-[42ch] text-[1.15rem] leading-relaxed">
            Cuéntanos qué proceso te quita más tiempo. Te respondemos con una primera idea y una fecha para el
            diagnóstico. Sin costo y sin compromiso.
          </p>

          <ol className="mt-10 flex flex-col gap-4">
            {NEXT.map((n, i) => (
              <li key={n} className="grid grid-cols-[2rem_1fr] items-baseline gap-x-2">
                <span className="mono tabular font-semibold" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="font-medium">{n}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-1 border-t border-ink/25 pt-6">
            <p className="text-[0.92rem] text-ink-muted">¿Prefieres escribirnos directo?</p>
            <a
              href="https://wa.me/524776191070"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] w-fit items-center gap-3 font-semibold underline-offset-4 hover:underline"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              +52 477 619 1070
              <span className="font-normal text-ink-muted">· WhatsApp</span>
            </a>
            <a
              href="mailto:hola@cyclo.mx"
              className="flex min-h-[44px] w-fit items-center gap-3 font-semibold underline-offset-4 hover:underline"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              hola@cyclo.mx
              <span className="font-normal text-ink-muted">· menos de 24 h</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
