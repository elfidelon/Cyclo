import AgentChat from './AgentChat'
import AgentTrace from './AgentTrace'
import BrandLogo from '../BrandLogo'

export default function AgentSection() {
  return (
    <section id="agente" aria-labelledby="agente-titulo" className="py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 id="agente-titulo" className="heading text-fg">
            No te lo contamos.
            <span className="block text-teal-text">Pregúntale.</span>
          </h2>
          <p className="lead mt-5 max-w-[36ch]">
            Es un agente real, como los que construimos. Te contesta y te agenda el diagnóstico. Mira lo que pasa detrás.
          </p>
          <p className="mono mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-5 text-[0.82rem] text-muted">
            Hecho con
            <span className="flex items-center gap-1.5 text-fg">
              <BrandLogo brand="n8n" className="h-4 w-4" />
              n8n
            </span>
            y
            <span className="flex items-center gap-1.5 text-fg">
              <BrandLogo brand="claude" className="h-4 w-4" />
              Claude
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:col-span-8 md:grid-cols-[1.08fr_1fr]">
          <AgentChat variant="section" />
          <AgentTrace variant="section" />
        </div>
      </div>
    </section>
  )
}
