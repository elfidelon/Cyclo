// Comprueba la carga diferida y el ciclo de vida sin navegador ni peticiones reales.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const moduleURL = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const compile = async (path) => ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
const frameURL = moduleURL(await compile('../src/lib/scroll-frame.ts'))
globalThis.lenisTest = { imports: 0, instances: [] }
const lenisURL = moduleURL(`
  globalThis.lenisTest.imports++;
  export default class {
    isScrolling = false; events = new Map(); calls = []; destroyed = false; stopped = false;
    constructor(options) { this.options = options; globalThis.lenisTest.instances.push(this) }
    on(name, callback) { this.events.set(name, callback) }
    raf(time) { this.time = time }
    scrollTo(target, options) { this.calls.push({target, options}); this.isScrolling = 'smooth' }
    stop() { this.stopped = true; this.isScrolling = false }
    start() { this.stopped = false }
    destroy() { this.destroyed = true }
  }
`)
const smoothURL = moduleURL((await compile('../src/lib/smooth.ts'))
  .replace("'./scroll-frame'", JSON.stringify(frameURL))
  .replace("'lenis'", JSON.stringify(lenisURL)))
let reduce = true
let locked = false
let seq = 0
const frames = new Map()
const listeners = new Map()
const native = []
const target = {
  getBoundingClientRect: () => ({ top: 4000 }),
  hasAttribute: () => true,
  focus() { this.focused = true },
  scrollIntoView: (options) => native.push(options),
}
globalThis.requestAnimationFrame = (callback) => { frames.set(++seq, callback); return seq }
globalThis.cancelAnimationFrame = (id) => frames.delete(id)
globalThis.document = {
  getElementById: () => target,
  documentElement: { classList: { contains: () => locked, toggle: (_name, value) => { locked = value } } },
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: (name) => listeners.delete(name),
}
globalThis.window = { matchMedia: () => ({ matches: reduce }), requestAnimationFrame }
const settle = () => new Promise((resolve) => setImmediate(resolve))

const reduced = await import(`${smoothURL}#reduced`)
reduced.startSmoothScroll()
reduced.scrollToSection('costo')
await settle()
assert.equal(lenisTest.imports, 0, 'no importa Lenis con movimiento reducido')
assert.deepEqual(native, [{ behavior: 'auto' }])
assert.equal(target.focused, true)
reduced.stopSmoothScroll()

reduce = false
const smooth = await import(`${smoothURL}#normal`)
smooth.startSmoothScroll()
smooth.stopSmoothScroll()
smooth.startSmoothScroll() // mismo ciclo que StrictMode
smooth.scrollToSection('costo') // ancla antes de resolver el import
assert.equal(lenisTest.instances.length, 0, 'no construye Lenis sin resolver la carga')
await settle()
assert.equal(lenisTest.instances.length, 1, 'ignora la carga cancelada por el desmontaje')
const engine = lenisTest.instances[0]
assert.equal(engine.options.autoRaf, false)
assert.equal(engine.options.syncTouch, false)
assert.equal(engine.calls.length, 1)
assert.equal(engine.calls[0].options.offset, 88)
assert.equal(engine.calls[0].options.duration, Math.min(2.2, 0.9 + 4088 / 4500))
assert.equal(native.length, 1, 'el ancla temprana espera la misma animación de Lenis')
smooth.lockScroll(true)
assert.equal(locked, true)
assert.equal(engine.stopped, true)
smooth.lockScroll(false)
assert.equal(engine.stopped, false)
smooth.stopSmoothScroll()
assert.equal(engine.destroyed, true)
assert.equal(frames.size, 0)
assert.equal(listeners.size, 0)

smooth.startSmoothScroll()
smooth.lockScroll(true) // un menú abierto antes de terminar la descarga
await settle()
const next = lenisTest.instances[1]
assert.equal(next.stopped, true)
smooth.lockScroll(false)
next.events.get('virtual-scroll')({ event: { type: 'touchmove' } })
assert.equal(frames.size, 0, 'el scroll táctil no enciende el reloj')
next.events.get('virtual-scroll')({ event: { type: 'wheel' } })
assert.equal(frames.size, 1, 'la rueda enciende el reloj')
smooth.stopSmoothScroll()
assert.equal(frames.size, 0)
console.log('Lenis: movimiento reducido, carga temprana, StrictMode, anclas, bloqueos y scroll táctil correctos.')
