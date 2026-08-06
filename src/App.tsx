import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import Industries from './components/Industries'
import Contact from './components/Contact'

export default function App() {
  return (
    <div className="bg-black">
      <Hero />
      <About />
      <Features />
      <Industries />
      <Contact />
    </div>
  )
}
