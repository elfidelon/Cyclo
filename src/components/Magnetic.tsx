import { PointerEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'

const MAX = 8

/** Acerca el elemento unos píxeles hacia el cursor. Solo con mouse y sin movimiento reducido. */
export default function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const [fine, setFine] = useState(false)
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 })
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 })

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const enabled = fine && !reduce

  function onMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current
    if (!enabled || !el) return
    const r = el.getBoundingClientRect()
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength))
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength))
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span ref={ref} className="inline-flex" style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}
