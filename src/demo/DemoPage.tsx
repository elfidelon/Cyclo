import { CSSProperties, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useMotionValue, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  CreditCard,
  FileText,
  Mic,
  Pause,
  Phone,
  Play,
  RotateCcw,
  UserRound,
  Users,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Logo from '../components/Logo'
import BrandLogo, { brandForTool } from '../components/BrandLogo'
import ResultCard from './ResultCard'
import GiroIcon from './GiroIcon'
import { DEMOS, Demo, ScriptItem, Tool } from './data'
import { sfx } from './sound'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SPEEDS = [1, 1.5, 2]
const WHATSAPP_NUMBER = '524951024002'

type Ev =
  | { at: number; type: 'msg'; i: number }
  | { at: number; type: 'typing'; until: number }
  | { at: number; type: 'step'; i: number; n: number }
  | { at: number; type: 'result'; i: number }
  | { at: number; type: 'end' }

// Convierte el guion en eventos con tiempo. Los mensajes del negocio llevan "escribiendo…"
// proporcional al largo del texto; cada paso del flujo deja un respiro para leerlo.
function buildTimeline(script: ScriptItem[]) {
  const evs: Ev[] = []
  let t = 700
  let prev: ScriptItem | null = null
  let n = 0
  script.forEach((it, i) => {
    if (it.kind === 'msg' && it.from === 'cliente') {
      t += prev === null ? 0 : 1500
      evs.push({ at: t, type: 'msg', i })
      t += 200
    } else if (it.kind === 'msg') {
      const typing = Math.min(2600, Math.max(1100, 700 + it.text.length * 14))
      evs.push({ at: t + 350, type: 'typing', until: t + 350 + typing })
      t += 350 + typing
      evs.push({ at: t, type: 'msg', i })
      t += 250
    } else {
      t += prev && prev.kind === 'step' ? 650 : 800
      evs.push({ at: t, type: 'step', i, n: n++ })
      if (it.result) evs.push({ at: t + 420, type: 'result', i })
    }
    prev = it
  })
  t += 1400
  evs.push({ at: t, type: 'end' })
  return { evs, end: t }
}

const TOOL_ICON: Partial<Record<Tool, typeof BellRing>> = {
  CRM: Users,
  PDF: FileText,
  Pago: CreditCard,
  Recordatorio: BellRing,
  'Tu equipo': UserRound,
}

function ToolIcon({ tool, className }: { tool: Tool; className: string }) {
  const brand = brandForTool(tool)
  if (brand) return <BrandLogo brand={brand} className={className} />
  const Icon = TOOL_ICON[tool] ?? BellRing
  return <Icon aria-hidden="true" className={className} />
}

function Bubble({ item }: { item: Extract<ScriptItem, { kind: 'msg' }> }) {
  const mine = item.from === 'cliente'
  return (
    <motion.li
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{ transformOrigin: mine ? 'bottom right' : 'bottom left' }}
      className={`chat-font max-w-[84%] whitespace-pre-line rounded-[10px] px-2.5 pb-1 pt-1.5 text-[0.92rem] leading-[1.35] text-[#111b21] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] ${
        mine ? 'self-end rounded-tr-[3px] bg-[#d9fdd3]' : 'self-start rounded-tl-[3px] bg-white'
      }`}
    >
      {item.file && (
        <span className="mb-1.5 flex items-center gap-2.5 rounded-md bg-black/[0.04] px-2.5 py-2 text-[0.82rem]">
          <span className="flex h-8 w-7 items-center justify-center rounded-[4px] bg-[#e5252a] text-[0.55rem] font-bold text-white">PDF</span>
          <span className="font-medium">{item.file}</span>
        </span>
      )}
      <span className="sr-only">{mine ? 'Cliente: ' : 'Negocio: '}</span>
      {item.text}
      <span className="ml-2 inline-flex translate-y-[3px] items-center gap-0.5 float-right text-[0.68rem] text-[#667781]">
        {item.time}
        {mine && <CheckCheck aria-hidden="true" className="h-3.5 w-3.5 text-[#53bdeb]" />}
      </span>
    </motion.li>
  )
}

type Msg = { i: number; item: Extract<ScriptItem, { kind: 'msg' }> }

function PhoneView({ demo, msgs, typing }: { demo: Demo; msgs: Msg[]; typing: boolean }) {
  const listRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs.length, typing])
  const first = demo.script.find((s) => s.kind === 'msg') as Extract<ScriptItem, { kind: 'msg' }>

  return (
    <div className="relative mx-auto w-full max-w-[370px]">
      <span className="absolute -top-3 left-6 z-10 rounded-full bg-[var(--accent)] px-3 py-1 text-[0.8rem] font-semibold text-white">
        Lo que ve tu {demo.audience}
      </span>
      <div className="rounded-[48px] bg-[#0b0b0c] p-[10px] shadow-[0_6px_8px_rgb(0_0_0/0.22)]">
        <div className="relative flex h-[min(640px,64svh)] min-h-[460px] flex-col lg:h-[min(700px,74svh)] lg:min-h-[520px] overflow-hidden rounded-[38px] bg-[#efeae2]">
          <div className="chat-font flex items-center justify-between bg-[#008069] px-6 pb-1 pt-3 text-[0.78rem] font-semibold text-white">
            <span className="tabular">{first.time}</span>
            <span className="h-[22px] w-[92px] rounded-full bg-black" aria-hidden="true" />
            <span aria-hidden="true">5G ▮▮▮</span>
          </div>
          <div className="chat-font flex items-center gap-2 bg-[#008069] px-2 pb-2.5 pt-1 text-white">
            <ChevronLeft aria-hidden="true" className="h-6 w-6" />
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--soft)] text-[0.8rem] font-bold text-[color:var(--accent)]"
            >
              {demo.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.98rem] font-semibold leading-tight">{demo.business}</span>
              <span className="block text-[0.75rem] text-white/85">{typing ? 'escribiendo…' : 'en línea'}</span>
            </span>
            <Video aria-hidden="true" className="h-5 w-5" />
            <Phone aria-hidden="true" className="mx-2 h-[18px] w-[18px]" />
          </div>

          <ol
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label={`Conversación de WhatsApp con ${demo.business}`}
            className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-3 pt-3"
          >
            <li className="chat-font mx-auto mb-1 rounded-md bg-[#fff5c4] px-3 py-1.5 text-center text-[0.7rem] leading-snug text-[#54656f]">
              Los mensajes de {demo.business} los contesta un asistente con IA
            </li>
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <Bubble key={m.i} item={m.item} />
              ))}
              {typing && (
                <motion.li
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="flex gap-1 self-start rounded-[10px] rounded-tl-[3px] bg-white px-3.5 py-3 shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]"
                  aria-hidden="true"
                >
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="typing-dot h-2 w-2 rounded-full bg-[#8696a0]" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </motion.li>
              )}
            </AnimatePresence>
          </ol>

          <div className="chat-font flex items-center gap-2 px-2 pb-4 pt-1" aria-hidden="true">
            <span className="flex-1 rounded-full bg-white px-4 py-2.5 text-[0.9rem] text-[#8696a0]">Mensaje</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008069] text-white">
              <Mic className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

type StepRow = { s: Extract<ScriptItem, { kind: 'step' }>; i: number }

function StepsCard({
  steps,
  firedSteps,
  lastStep,
  ended,
  playing,
  className = '',
}: {
  steps: StepRow[]
  firedSteps: Set<number>
  lastStep: number
  ended: boolean
  playing: boolean
  className?: string
}) {
  return (
      <div className={`rounded-2xl bg-white p-4 text-slate-900 shadow-[0_2px_8px_rgb(0_0_0/0.08)] sm:p-5 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[1rem] font-bold">Lo que pasa detrás</h2>
          <p className="flex items-center gap-2 text-[0.78rem] font-semibold text-slate-500">
            <span className={`h-2 w-2 rounded-full ${playing ? 'live-dot bg-[var(--accent)]' : 'bg-slate-300'}`} aria-hidden="true" />
            {playing ? 'trabajando' : ended ? 'listo' : 'en pausa'}
          </p>
        </div>
        <ol className="mt-4 flex flex-col gap-1">
          {steps.map(({ s, i }) => {
            const done = firedSteps.has(i)
            const current = i === lastStep && !ended
            return (
              <li
                key={i}
                className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-2 transition-[background-color,opacity] duration-500 ${
                  current ? 'bg-[var(--soft)]' : ''
                } ${done ? 'opacity-100' : 'opacity-35'}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500 ${
                    done ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {done && !current ? <Check aria-hidden="true" className="h-4 w-4" /> : <ToolIcon tool={s.tool} className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.8rem] font-semibold text-[color:var(--accent)]">{s.tool}</span>
                  <span className="block text-[0.95rem] leading-snug">{s.text}</span>
                </span>
                <span className="tabular text-right text-[0.78rem] text-slate-500">
                  {s.clock}
                  {s.dur && <span className="block">{s.dur}</span>}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
  )
}

export default function DemoPage({ demo }: { demo: Demo }) {
  const reduce = useReducedMotion()
  const { evs, end } = useMemo(() => buildTimeline(demo.script), [demo])
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [muted, setMuted] = useState(sfx.muted)
  const [fired, setFired] = useState(0)
  const [typing, setTyping] = useState(false)
  const elapsed = useRef(0)
  const firedRef = useRef(0)
  const lastTick = useRef(0)
  const progress = useMotionValue(0)
  const phoneRef = useRef<HTMLElement>(null)

  const playEventSound = useCallback(
    (ev: Ev) => {
      if (ev.type === 'msg') {
        const item = demo.script[ev.i] as Extract<ScriptItem, { kind: 'msg' }>
        if (item.from === 'cliente') sfx.sent()
        else sfx.incoming()
      } else if (ev.type === 'step') sfx.step(ev.n)
      else if (ev.type === 'result') sfx.result()
      else if (ev.type === 'end') sfx.success()
    },
    [demo],
  )

  // Reloj de la demo: avanza con requestAnimationFrame y solo vuelve a pintar React
  // cuando ocurre un evento nuevo o cambia el "escribiendo…".
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      const dt = Math.min(now - last, 100) * speed
      last = now
      elapsed.current = Math.min(end, elapsed.current + dt)
      progress.set(elapsed.current / end)
      let count = firedRef.current
      while (count < evs.length && evs[count].at <= elapsed.current) {
        playEventSound(evs[count])
        count++
      }
      if (count !== firedRef.current) {
        firedRef.current = count
        setFired(count)
      }
      const isTyping = evs.some((e) => e.type === 'typing' && e.at <= elapsed.current && elapsed.current < e.until)
      setTyping((prev) => (prev === isTyping ? prev : isTyping))
      if (isTyping && now - lastTick.current > 120 / speed) {
        lastTick.current = now
        sfx.typing()
      }
      if (elapsed.current >= end) {
        setPlaying(false)
        setTyping(false)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, end, evs, playEventSound, progress])

  const jumpToEnd = useCallback(() => {
    elapsed.current = end
    firedRef.current = evs.length
    progress.set(1)
    setFired(evs.length)
    setTyping(false)
    setPlaying(false)
  }, [end, evs.length, progress])

  const restart = useCallback(() => {
    elapsed.current = 0
    firedRef.current = 0
    progress.set(0)
    setFired(0)
    setTyping(false)
    sfx.unlock()
    sfx.start()
    setPlaying(true)
  }, [progress])

  // En celular el teléfono queda abajo del título: al iniciar lo trae a la vista.
  function showPhone() {
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    requestAnimationFrame(() => phoneRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }))
  }

  // "Volver": si llegaste desde el sitio, regresa en el historial (al mismo lugar donde
  // estabas); si abriste la demo directo, el enlace lleva a la sección de demos.
  function goBack(e: MouseEvent<HTMLAnchorElement>) {
    try {
      const from = document.referrer ? new URL(document.referrer) : null
      if (from && from.origin === window.location.origin && window.history.length > 1) {
        e.preventDefault()
        window.history.back()
      }
    } catch {
      // Sin referrer válido: sigue el enlace normal.
    }
  }

  function start(withSound: boolean) {
    sfx.setMuted(!withSound)
    setMuted(!withSound)
    sfx.unlock()
    setStarted(true)
    showPhone()
    if (reduce) {
      jumpToEnd()
      sfx.success()
    } else {
      sfx.start()
      setPlaying(true)
    }
  }

  function togglePlay() {
    if (elapsed.current >= end) {
      restart()
      return
    }
    sfx.unlock()
    setPlaying((p) => !p)
  }

  function toggleSound() {
    const next = !muted
    setMuted(next)
    sfx.setMuted(next)
    if (!next) sfx.unlock()
  }

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const firedEvs = evs.slice(0, fired)
  const msgs: Msg[] = firedEvs
    .filter((e): e is Extract<Ev, { type: 'msg' }> => e.type === 'msg')
    .map((e) => ({ i: e.i, item: demo.script[e.i] as Extract<ScriptItem, { kind: 'msg' }> }))
  const firedSteps = new Set(firedEvs.filter((e) => e.type === 'step').map((e) => (e as Extract<Ev, { type: 'step' }>).i))
  const results = firedEvs
    .filter((e): e is Extract<Ev, { type: 'result' }> => e.type === 'result')
    .map((e) => ({ i: e.i, result: (demo.script[e.i] as Extract<ScriptItem, { kind: 'step' }>).result! }))
  const ended = firedEvs.some((e) => e.type === 'end')
  const steps = demo.script.map((s, i) => ({ s, i })).filter((x): x is StepRow => x.s.kind === 'step')
  const lastStep = Math.max(-1, ...Array.from(firedSteps))
  const current = steps.find((x) => x.i === lastStep) ?? null
  const stepsProps = { steps, firedSteps, lastStep, ended, playing }
  const others = DEMOS.filter((d) => d.slug !== demo.slug)
  const waText = encodeURIComponent(`Hola, vi la demo de ${demo.giro.toLowerCase()} de Cyclo y quiero algo así para mi negocio.`)

  const vars = {
    '--accent': demo.theme.accent,
    '--soft': demo.theme.soft,
    '--tint': demo.theme.tint,
  } as CSSProperties

  const ghostBtn = 'flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50'

  return (
    <MotionConfig reducedMotion="user">
      <div style={vars} className="min-h-screen bg-[var(--tint)] text-slate-900">
        <AnimatePresence>
          {!started && (
            <motion.div
              key="intro"
              role="dialog"
              aria-modal="true"
              aria-labelledby="intro-titulo"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-[var(--tint)] px-6 py-10 text-center"
            >
              <a
                href="../#demos"
                onClick={goBack}
                className="absolute left-4 top-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-[0.95rem] font-semibold text-slate-700 hover:bg-white sm:left-6 sm:top-6"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Volver
              </a>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--accent)] text-white"
              >
                <GiroIcon slug={demo.slug} className="h-11 w-11" />
              </motion.span>
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1, ease: EASE }}>
                <p className="mt-6 text-[1.05rem] font-semibold text-[color:var(--accent)]">
                  Demo · {demo.giro}
                </p>
                <h2
                  id="intro-titulo"
                  className="mx-auto mt-3 max-w-[18ch] text-[clamp(2.2rem,1.2rem+4vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.03em] [text-wrap:balance]"
                >
                  {demo.headline}
                </h2>
                <p className="mx-auto mt-5 max-w-[50ch] text-[1.1rem] leading-relaxed text-slate-700">{demo.sub}</p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => start(true)}
                    autoFocus
                    className="inline-flex min-h-[56px] items-center gap-3 rounded-full bg-[var(--accent)] px-7 text-[1.05rem] font-bold text-white transition-transform active:scale-[0.98]"
                  >
                    <Volume2 aria-hidden="true" className="h-5 w-5" />
                    Iniciar demo con sonido
                  </button>
                  <button
                    type="button"
                    onClick={() => start(false)}
                    className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-white px-6 text-[1rem] font-semibold text-slate-800 ring-1 ring-inset ring-slate-300"
                  >
                    Ver sin sonido
                  </button>
                </div>
                <p className="mt-8 flex items-center justify-center gap-2 text-[0.9rem] text-slate-600">
                  <Logo className="h-4 w-4" stroke="currentColor" strokeWidth={9} />
                  {demo.business} · negocio y datos de ejemplo
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgb(15_23_42/0.08)]">
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <a
                href="../#demos"
                onClick={goBack}
                aria-label="Volver a las demos de Cyclo"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-2.5 text-[0.92rem] font-semibold text-slate-700 hover:bg-slate-100 sm:px-3"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                <span className="hidden sm:inline">Volver</span>
              </a>
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white sm:flex">
                <GiroIcon slug={demo.slug} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[1rem] font-bold leading-tight">{demo.business}</span>
                <span className="block truncate text-[0.82rem] text-slate-600">Demo · {demo.giro}</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Controles de la demo">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Pausar demo' : 'Reproducir demo'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white"
              >
                {playing ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
              </button>
              <button type="button" onClick={restart} aria-label="Reiniciar demo" className={ghostBtn}>
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                aria-label={`Velocidad ${speed} veces. Cambiar velocidad`}
                className={`${ghostBtn} tabular w-auto min-w-[2.75rem] px-2 text-[0.88rem] font-bold`}
              >
                {speed}×
              </button>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? 'Activar sonido' : 'Quitar sonido'}
                className={ghostBtn}
              >
                {muted ? <VolumeX aria-hidden="true" className="h-4 w-4" /> : <Volume2 aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="h-1 bg-slate-200">
            <motion.div className="h-full origin-left bg-[var(--accent)]" style={{ scaleX: progress }} />
          </div>
        </header>

        <main className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_370px_minmax(0,1fr)] lg:gap-8 lg:pt-10">
          <section aria-labelledby="titulo-demo" className="order-1 lg:order-none lg:pt-2">
            <h1 id="titulo-demo" className="text-[clamp(1.9rem,1.2rem+2vw,2.6rem)] font-extrabold leading-[1.08] tracking-[-0.03em] [text-wrap:balance]">
              {demo.headline}
            </h1>
            <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-slate-700">{demo.sub}</p>
            <StepsCard {...stepsProps} className="mt-8 hidden lg:block" />
          </section>

          <section ref={phoneRef} aria-label="Conversación de ejemplo" className="order-2 scroll-mt-[76px] pt-3 lg:order-none lg:pt-4">
            <PhoneView demo={demo} msgs={msgs} typing={typing} />
            <div className="mx-auto mt-4 min-h-[64px] max-w-[370px] lg:hidden" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                {current && (
                  <motion.div
                    key={current.i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-slate-900 shadow-[0_2px_8px_rgb(15_23_42/0.08)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <ToolIcon tool={current.s.tool} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.8rem] font-semibold text-[color:var(--accent)]">Detrás · {current.s.tool}</span>
                      <span className="block truncate text-[0.95rem]">{current.s.text}</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <StepsCard {...stepsProps} className="order-4 lg:hidden" />

          <section aria-labelledby="queda-listo" className="order-3 lg:order-none lg:pt-2">
            <h2 id="queda-listo" className="text-[1.25rem] font-extrabold tracking-[-0.02em]">
              Lo que queda listo
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {ended && (
                  <motion.div
                    key="resumen"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="rounded-2xl bg-[var(--accent)] p-5 text-white"
                  >
                    <p className="tabular text-[clamp(2.6rem,2rem+2vw,3.6rem)] font-extrabold leading-none tracking-[-0.03em]">{demo.summary.big}</p>
                    <p className="mt-1 text-[1.05rem] font-semibold">{demo.summary.label}</p>
                    <ul className="mt-4 flex flex-col gap-1.5 text-[0.95rem]">
                      {demo.summary.facts.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                {[...results].reverse().map(({ i, result }) => (
                  <motion.div
                    key={i}
                    layout="position"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <ResultCard result={result} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {results.length === 0 && !ended && (
                <p className="rounded-2xl border-2 border-dashed border-slate-300 px-5 py-6 text-[0.98rem] leading-relaxed text-slate-600">
                  Aquí aparece lo que el sistema deja listo mientras conversa: la cita, el registro y el recordatorio.
                </p>
              )}
            </div>
          </section>
        </main>

        <section aria-labelledby="cta-demo" className="bg-bg text-fg">
          <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <h2 id="cta-demo" className="text-[clamp(1.9rem,1.2rem+2.4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]">
                ¿Lo quieres así en tu negocio?
              </h2>
              <p className="mt-4 max-w-[48ch] text-[1.05rem] leading-relaxed text-muted">
                Lo construimos con tus horarios, precios y forma de hablar. Empieza con un diagnóstico gratis de 30 minutos.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="../#contacto"
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-fg px-6 font-bold text-bg transition-colors hover:bg-white"
                >
                  Agenda tu diagnóstico
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-6 font-semibold ring-1 ring-inset ring-line transition-colors hover:bg-raised"
                >
                  <BrandLogo brand="whatsapp" color="#25D366" className="h-4 w-4" />
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
            <nav aria-label="Otras demos">
              <p className="text-[0.95rem] font-semibold text-muted">Otras demos</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {others.map((d) => (
                  <li key={d.slug}>
                    <a
                      href={`${d.slug}.html`}
                      onClick={(e) => {
                        // Cambia de demo sin apilar historial: "atrás" sigue regresando al sitio.
                        e.preventDefault()
                        window.location.replace(`${d.slug}.html`)
                      }}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-raised py-1 pl-1.5 pr-4 text-[0.92rem] font-semibold text-fg ring-1 ring-inset ring-line transition-colors hover:bg-sunken"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ background: d.theme.brand, color: d.theme.ink }}
                      >
                        <GiroIcon slug={d.slug} className="h-4 w-4" />
                      </span>
                      {d.giro}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="mx-auto max-w-[1320px] px-4 pb-8 text-[0.85rem] text-muted sm:px-6">
            Demo de Cyclo, León, Guanajuato. El negocio, los nombres y los precios son de ejemplo.
          </p>
        </section>
      </div>
    </MotionConfig>
  )
}
