import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/scroll-frame.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { createScrollFrame } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
let seq = 0
const frames = new Map()
globalThis.requestAnimationFrame = (cb) => { frames.set(++seq, cb); return seq }
globalThis.cancelAnimationFrame = (id) => frames.delete(id)
function next(time) {
  const [id, callback] = frames.entries().next().value
  frames.delete(id)
  callback(time)
}

const times = []
const clock = { isScrolling: false, raf: (time) => times.push(time) }
const loop = createScrollFrame(clock)
assert.equal(frames.size, 0, 'ningún frame en reposo')
loop.wake()
loop.wake()
assert.equal(frames.size, 1, 'no duplica RAF en una ráfaga de eventos')
clock.isScrolling = 'smooth'
next(16)
assert.equal(frames.size, 1, 'continúa durante toda la animación')
clock.isScrolling = false
next(32)
assert.equal(frames.size, 0, 'se duerme al completar el desplazamiento')
loop.wake()
assert.notEqual(times.at(-1), 32, 'reinicia el reloj después de un periodo en reposo')
clock.isScrolling = 'native'
next(10000)
assert.equal(frames.size, 0, 'el scroll nativo no mantiene un bucle')
loop.wake()
loop.stop()
assert.equal(frames.size, 0, 'el desmontaje cancela el frame pendiente')
loop.wake()
assert.equal(frames.size, 1, 'puede reiniciarse tras cancelar')
loop.stop()
console.log('Reloj de scroll: reposo, animación, reanudación, scroll nativo y limpieza correctos.')
