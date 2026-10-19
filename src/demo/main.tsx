import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DemoPage from './DemoPage'
import { demoBySlug } from './data'
import '../index.css'

const el = document.getElementById('root')!
const root = createRoot(el)
const demo = demoBySlug(el.dataset.giro)

// Fondo claro con el tinte del giro (el color fuerte va solo en botones y resaltados).
const html = document.documentElement
html.style.background = demo.theme.tint
html.style.colorScheme = 'light'
html.style.scrollPaddingTop = '0'
document.body.style.background = demo.theme.tint
document.body.style.color = '#0f172a'
document.title = `Demo · ${demo.giro} — Cyclo`

// Contra clickjacking, igual que el sitio principal.
const framed = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

if (framed) {
  root.render(
    <p style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <a href={window.location.href} target="_top" rel="noopener noreferrer">
        Abrir la demo de Cyclo
      </a>
    </p>,
  )
} else {
  root.render(
    <StrictMode>
      <DemoPage demo={demo} />
    </StrictMode>,
  )
}
