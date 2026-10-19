// Sonidos de las demos, sintetizados con Web Audio: sin archivos, sin red.
// El navegador solo deja sonar después de un toque o clic, por eso unlock() se llama
// desde el botón "Iniciar demo".

const KEY = 'cyclo:demo-sonido'

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  muted = (() => {
    try {
      return window.localStorage.getItem(KEY) === 'off'
    } catch {
      return false
    }
  })()

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }
    void this.ctx.resume()
  }

  setMuted(m: boolean) {
    this.muted = m
    try {
      window.localStorage.setItem(KEY, m ? 'off' : 'on')
    } catch {
      // Sin almacenamiento: dura lo que dure la pestaña.
    }
  }

  private ready() {
    return !this.muted && this.ctx && this.master && this.ctx.state === 'running' ? this.ctx : null
  }

  private tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; delay?: number; to?: number } = {}) {
    const ctx = this.ready()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = opts.type ?? 'sine'
    osc.frequency.setValueAtTime(freq, t0)
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  private noise(dur: number, freq: number, gain: number, delay = 0) {
    const ctx = this.ready()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime + delay
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = 1.2
    const g = ctx.createGain()
    g.gain.value = gain
    src.connect(filter).connect(g).connect(this.master)
    src.start(t0)
  }

  /** Llega un mensaje del negocio: dos notas cortas, como una notificación. */
  incoming() {
    this.tone(988, 0.09, { gain: 0.16 })
    this.tone(1319, 0.14, { gain: 0.14, delay: 0.085 })
  }

  /** El cliente envía: un barrido corto hacia arriba. */
  sent() {
    this.noise(0.12, 2200, 0.05)
    this.tone(540, 0.12, { type: 'triangle', gain: 0.09, to: 880 })
  }

  /** Tecleo mientras el negocio escribe. */
  typing() {
    this.noise(0.025, 3800, 0.035)
  }

  /** Un paso del flujo: la nota sube con cada paso. */
  step(i: number) {
    const f = 523.25 * Math.pow(2, (Math.min(i, 12) * 2) / 12)
    this.tone(f, 0.11, { type: 'triangle', gain: 0.07 })
  }

  /** Aparece un resultado (cita, registro, recordatorio). */
  result() {
    this.tone(1568, 0.08, { gain: 0.08 })
    this.tone(2093, 0.12, { gain: 0.06, delay: 0.06 })
  }

  /** Final de la demo: acorde que sube. */
  success() {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.5, { type: 'triangle', gain: 0.1, delay: i * 0.09 }))
  }

  /** Arranque de la demo. */
  start() {
    this.tone(392, 0.18, { type: 'triangle', gain: 0.08 })
    this.tone(587.33, 0.24, { type: 'triangle', gain: 0.08, delay: 0.1 })
  }
}

export const sfx = new Sfx()
