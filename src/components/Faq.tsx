import { Plus } from 'lucide-react'

const QUESTIONS = [
  {
    q: '¿Tengo que saber de tecnología?',
    a: 'No. Nosotros lo construimos y lo mantenemos. Tú sigues usando WhatsApp, tu calendario y tus hojas de cálculo.',
  },
  {
    q: '¿Qué pasa si la IA contesta algo mal?',
    a: 'Solo contesta con la información que tú apruebas. Lo que no sabe, las urgencias y las quejas pasan a una persona de tu equipo.',
  },
  {
    q: '¿Puedo usar mi número de WhatsApp actual?',
    a: 'En la mayoría de los casos, sí. Usamos la API oficial de WhatsApp Business; en el diagnóstico revisamos tu número.',
  },
  {
    q: '¿Cuánto tarda en estar funcionando?',
    a: 'De 2 a 4 semanas desde el diagnóstico, según cuántos pasos tenga.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Depende de cuántos procesos y mensajes maneje tu negocio. Después del diagnóstico te damos una cotización cerrada y por escrito.',
  },
  {
    q: '¿De quién son los datos?',
    a: 'Tuyos. Viven en tus cuentas de Google y puedes quitarnos el acceso cuando quieras.',
  },
]

export default function Faq() {
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className="py-24 sm:py-28">
      <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="preguntas-titulo" className="heading text-fg">
              Lo que siempre nos preguntan
            </h2>
            <p className="mt-5 text-muted">
              ¿Tienes otra duda?{' '}
              <a
                href="https://wa.me/524951024002"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-teal-text underline-offset-4 hover:underline"
              >
                Escríbenos por WhatsApp
              </a>
              .
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-t border-line last:border-b">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.15rem] font-semibold text-fg transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-teal-text transition-transform duration-300 ease-out-expo group-open:rotate-45"
                />
              </summary>
              <p className="max-w-[64ch] pb-6 pr-10 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
