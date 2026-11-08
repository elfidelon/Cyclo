type ScrollClock = {
  raf: (time: number) => void
  readonly isScrolling: boolean | 'native' | 'smooth'
}

/** Lenis solo necesita un reloj mientras anima; el scroll táctil es nativo. */
export function createScrollFrame(clock: ScrollClock) {
  let frame = 0

  function tick(time: number) {
    clock.raf(time)
    frame = clock.isScrolling === 'smooth' ? requestAnimationFrame(tick) : 0
  }

  return {
    wake() {
      if (frame) return
      // Actualiza el origen temporal ANTES de iniciar otra animación. Así un periodo
      // en reposo no se convierte en un delta enorme que salte al final del ancla.
      clock.raf(performance.now())
      frame = requestAnimationFrame(tick)
    },
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}
