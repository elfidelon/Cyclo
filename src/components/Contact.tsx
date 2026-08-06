import { Mail, MessageCircle } from 'lucide-react'
import Logo from './Logo'
import ContactForm from './ContactForm'

export default function Contact() {
  return (
    <section id="contacto" className="bg-black px-4 sm:px-6 py-20 sm:py-28 scroll-mt-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div>
          <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4">Contacto</p>
          <h2 className="text-primary text-2xl sm:text-3xl md:text-4xl font-normal leading-tight mb-5">
            ¿Procesos que consumen demasiado tiempo?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-md">
            Una sesión de 30 minutos para evaluar tu caso, sin costo. Si la automatización puede
            mover tu operación, te lo decimos con números concretos.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/524776191070"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-primary hover:text-white transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              +52 477 619 1070 · Respuesta inmediata
            </a>
            <a
              href="mailto:hola@cyclo.mx"
              className="flex items-center gap-3 text-primary hover:text-white transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              hola@cyclo.mx · Menos de 24 horas
            </a>
          </div>
        </div>

        <ContactForm />
      </div>

      <div className="max-w-6xl mx-auto flex items-center justify-between mt-16 pt-8 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Logo className="w-5 h-5" />
          <span className="text-primary font-medium text-sm">Cyclo</span>
        </div>
        <span className="text-gray-500 text-xs">© 2026 Cyclo · Ciudad de México</span>
      </div>
    </section>
  )
}
