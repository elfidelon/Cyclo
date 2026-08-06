import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import ScrollRevealText from './ScrollRevealText'

export default function About() {
  return (
    <section id="nosotros" className="bg-black py-20 sm:py-28 md:py-36 px-4 scroll-mt-6">
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto text-center py-16 sm:py-20 md:py-28 px-6 sm:px-10">
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-6 sm:mb-8">
          Automatización con IA
        </p>

        <WordsPullUpMultiStyle
          containerClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] mb-8 sm:mb-10"
          segments={[
            { text: 'Somos Cyclo,', className: 'font-normal text-primary' },
            { text: 'un equipo de automatización', className: 'italic font-serif text-primary' },
            {
              text: 'que diseña sistemas de IA para operar tu negocio sin fricción.',
              className: 'font-normal text-primary',
            },
          ]}
        />

        <ScrollRevealText
          className="max-w-2xl mx-auto text-[#DEDBC8] text-xs sm:text-sm md:text-base leading-relaxed"
          text="Trabajamos con clínicas, inmobiliarias, despachos contables y agencias en México, mapeando su operación para encontrar dónde la inteligencia artificial genera más valor. Diseñamos, implementamos y medimos en ciclos cortos, con resultados verificables desde la primera semana."
        />
      </div>
    </section>
  )
}
