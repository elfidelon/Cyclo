import { Plus } from 'lucide-react'

const QUESTIONS = [
  {
    q: '¿Tengo que saber de tecnología?',
    a: 'No. Nosotros diseñamos, construimos y mantenemos el sistema. Tú lo usas desde lo que ya conoces: WhatsApp, tu calendario y tus hojas de cálculo.',
  },
  {
    q: '¿Qué pasa si la IA contesta algo mal?',
    a: 'Solo responde con la información que tú apruebas: precios, horarios y políticas. Cuando una pregunta sale de eso, o detecta una urgencia o una queja, pasa la conversación a una persona de tu equipo. Además revisamos conversaciones cada mes para corregir y afinar.',
  },
  {
    q: '¿Puedo usar mi número de WhatsApp actual?',
    a: 'En la mayoría de los casos, sí. Trabajamos con WhatsApp Business API, el canal oficial de Meta para empresas. En el diagnóstico revisamos tu número y te explicamos las opciones.',
  },
  {
    q: '¿Cuánto tarda en estar funcionando?',
    a: 'Un sistema típico queda listo en 2 a 4 semanas desde el diagnóstico, según cuántos pasos tenga y cuántas herramientas conecte.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Depende de cuántos procesos, canales y mensajes maneje tu negocio. Después del diagnóstico te damos una cotización cerrada y por escrito, con lo que incluye y lo que no.',
  },
  {
    q: '¿Funciona con lo que ya uso?',
    a: 'Trabajamos con WhatsApp, Google Calendar, Sheets, Gmail y Drive, y podemos conectar la mayoría de los CRM y sistemas que tengan API. Si usas algo menos común, lo revisamos en el diagnóstico.',
  },
  {
    q: '¿De quién son los datos?',
    a: 'Tuyos. Los contactos, citas y registros viven en tus cuentas. Nosotros solo tenemos el acceso necesario para operar el sistema, y puedes retirarlo cuando quieras.',
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
                href="https://wa.me/524776191070"
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
