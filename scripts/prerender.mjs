// Genera el HTML de la página principal en el build. Sin esto el navegador recibe un
// <div id="root"></div> vacío y no pinta nada hasta descargar y correr todo el JavaScript.
// Con esto el texto, los botones y el hero se ven desde el primer pintado y React solo
// "hidrata" lo que ya está (ver src/main.tsx).
import { readFile, rm, writeFile } from 'node:fs/promises'

const ssrDir = new URL('../dist-ssr/', import.meta.url)
const page = new URL('../dist/index.html', import.meta.url)
const EMPTY_ROOT = '<div id="root"></div>'

const { render } = await import(new URL('entry-server.js', ssrDir).href)
const html = await readFile(page, 'utf8')
if (!html.includes(EMPTY_ROOT)) throw new Error(`dist/index.html no trae ${EMPTY_ROOT}`)

const app = render()
await writeFile(page, html.replace(EMPTY_ROOT, `<div id="root">${app}</div>`))
await rm(ssrDir, { recursive: true, force: true })
console.log(`prerender: dist/index.html con ${(app.length / 1024).toFixed(0)} KB de HTML de la página`)
