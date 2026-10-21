import { useEffect, useState } from 'react'

const formatter = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// La página se genera en el build: el HTML trae este marcador del mismo ancho y la hora
// real se pone al cargar, así el servidor y el navegador pintan lo mismo al hidratar.
const PLACEHOLDER = '--:--'

/** Hora local de León (zona del centro de México), al minuto. */
export function useLeonTime() {
  const [time, setTime] = useState(PLACEHOLDER)
  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()))
    tick()
    let id = 0
    // Alinea el primer cambio con el inicio del siguiente minuto.
    const first = window.setTimeout(() => {
      tick()
      id = window.setInterval(tick, 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [])
  return time
}

export function leonClock(date = new Date()) {
  return formatter.format(date)
}
