import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CostCalculator from './components/CostCalculator'
import Systems from './components/Systems'
import Behind from './components/Behind'
import Method from './components/Method'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#contenido"
        className="fixed left-4 top-3 z-skip -translate-y-24 rounded-full bg-fg px-5 py-3 font-semibold text-bg transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">
        <Hero />
        <CostCalculator />
        <Systems />
        <Behind />
        <Method />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
