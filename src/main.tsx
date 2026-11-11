import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './site.css'

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

// Al recargar, la página vuelve arriba. Sin esto el navegador regresa a donde estabas, o salta a
// la sección que dejó el menú en la dirección (#demos, #sistemas…), y parece que te manda abajo.
// Con la flecha de atrás (por ejemplo, al salir de una demo) sí regresa a donde estabas.
// Un enlace nuevo con #seccion sigue abriendo esa sección.
const SCROLL_KEY = 'cyclo:scroll-inicio'
const navType = (performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined)?.type
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (navType === 'reload') {
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search)
  window.scrollTo(0, 0)
  // Por si el navegador vuelve a bajar al terminar de cargar (si la persona ya se movió, se respeta).
  let moved = false
  const markMoved = () => {
    moved = true
  }
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
    window.addEventListener(ev, markMoved, { once: true, passive: true })
  }
  window.addEventListener('load', () => !moved && window.scrollY > 0 && window.scrollTo(0, 0), { once: true })
} else if (navType === 'back_forward') {
  let y = 0
  try {
    y = Number(sessionStorage.getItem(SCROLL_KEY)) || 0
  } catch {
    // Sin sessionStorage (modo privado estricto) se queda arriba.
  }
  if (y > 0) window.scrollTo(0, y)
}
window.addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)))
  } catch {
    // Igual que arriba: si no se puede guardar, no pasa nada.
  }
})

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
