import Lenis from 'lenis'

// Scroll suave en escritorio. En táctil Lenis no suaviza (syncTouch: false) y con
// movimiento reducido no se crea: la página usa el scroll nativo.
let lenis: Lenis | null = null

// Lenis ya resta el scroll-padding-top del CSS (5.5rem = 88 px, pensado para el scroll
// nativo). Las secciones traen su propio aire arriba (96–128 px), más que la cápsula del
// menú, así que se compensa para que el borde de la sección llegue al borde de la pantalla.
const OFFSET = 88

// Arranca despacio, acelera y frena despacio: se siente como un desplazamiento, no un salto.
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Con el menú móvil o el chat abiertos el scroll está congelado; se espera a que se libere.
function whenUnlocked(fn: () => void, tries = 0) {
  if (!document.documentElement.classList.contains('scroll-locked') || tries > 40) fn()
  else window.requestAnimationFrame(() => whenUnlocked(fn, tries + 1))
}

/** Lleva la vista a una sección. La duración crece con la distancia (de 0.9 a 2.2 s). */
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return false
  const focus = () => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
  whenUnlocked(() => {
    if (lenis) {
      const distance = Math.abs(el.getBoundingClientRect().top + OFFSET)
      const duration = Math.min(2.2, 0.9 + distance / 4500)
      lenis.scrollTo(el, { offset: OFFSET, duration, easing: easeInOutCubic, onComplete: focus })
    } else {
      el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
      focus()
    }
  })
  return true
}

function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const link = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!link) return
  const id = decodeURIComponent(link.hash.slice(1))
  if (!id || !document.getElementById(id)) return
  e.preventDefault()
  scrollToSection(id)
  if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`)
}

export function startSmoothScroll() {
  if (typeof window === 'undefined') return
  document.addEventListener('click', onAnchorClick)
  if (lenis || reducedMotion()) return
  lenis = new Lenis({ autoRaf: true, lerp: 0.1, stopInertiaOnNavigate: true })
}

export function stopSmoothScroll() {
  document.removeEventListener('click', onAnchorClick)
  lenis?.destroy()
  lenis = null
}

/** Congela el scroll de la página (por ejemplo, con el chat abierto encima). */
export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('scroll-locked', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}
