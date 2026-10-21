import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const container = document.getElementById('root')!

// Contra clickjacking: GitHub Pages no permite la cabecera frame-ancestors, así que si
// otra página mete este sitio en un iframe no lo mostramos, solo un enlace para abrirlo.
const framed = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

if (framed) {
  container.textContent = ''
  createRoot(container).render(
    <p style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <a href={window.location.href} target="_top" rel="noopener noreferrer" style={{ color: '#4fc4d1' }}>
        Abrir el sitio de Cyclo
      </a>
    </p>,
  )
} else {
  const app = (
    <StrictMode>
      <App />
    </StrictMode>
  )
  // En el build la página ya viene pintada (scripts/prerender.mjs): React solo la "hidrata".
  // En desarrollo el contenedor llega vacío y se pinta normal.
  if (container.firstElementChild) hydrateRoot(container, app)
  else createRoot(container).render(app)
}
