import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import CostCalculator from './components/CostCalculator'
import Systems from './components/Systems'
import Demos from './components/Demos'
import Behind from './components/Behind'
import Method from './components/Method'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { AgentProvider } from './components/agent/AgentProvider'
import AgentSection from './components/agent/AgentSection'
import AgentLauncher from './components/agent/AgentLauncher'
import { startSmoothScroll, stopSmoothScroll } from './lib/smooth'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    return stopSmoothScroll
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AgentProvider>
        <a
          href="#contenido"
          className="fixed left-4 top-3 z-skip -translate-y-24 rounded-full bg-fg px-5 py-3 font-semibold text-bg transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido">
          <Hero />
          <Ticker />
          <CostCalculator />
          <Systems />
          <Demos />
          <AgentSection />
          <Contact />
          <Behind />
          <Method />
          <Faq />
        </main>
        <Footer />
        <AgentLauncher />
      </AgentProvider>
    </MotionConfig>
  )
}
