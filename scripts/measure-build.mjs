// Inventario reproducible del build, sin servidor ni acceso a la red.
import { readFile, readdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { posix } from 'node:path'
import { parseAst } from 'rollup/parseAst'

const dir = process.argv[2] || 'dist'
const files = await readdir(`${dir}/assets`)
const chunks = new Map()
for (const file of files.filter((file) => file.endsWith('.js'))) {
  const code = await readFile(`${dir}/assets/${file}`)
  const imports = parseAst(code.toString()).body
    .filter((node) => node.type === 'ImportDeclaration' || node.type.startsWith('Export') && node.source)
    .map((node) => posix.normalize(posix.join('assets', node.source.value)))
  chunks.set(`assets/${file}`, { file: `assets/${file}`, raw: code.length, gzip: gzipSync(code).length, imports })
}

const html = await readFile(`${dir}/index.html`, 'utf8')
const initial = new Set()
function visit(file) {
  if (initial.has(file) || !chunks.has(file)) return
  initial.add(file)
  chunks.get(file).imports.forEach(visit)
}
for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="\/(assets\/[^"?]+\.js)"/g)) visit(match[1])
const total = (items) => items.reduce((sum, item) => ({ raw: sum.raw + item.raw, gzip: sum.gzip + item.gzip }), { raw: 0, gzip: 0 })
const css = await Promise.all(files.filter((file) => file.endsWith('.css')).map(async (file) => {
  const code = await readFile(`${dir}/assets/${file}`)
  return { file: `assets/${file}`, raw: code.length, gzip: gzipSync(code).length }
}))
console.log(JSON.stringify({
  directory: dir,
  initialJS: { ...total([...initial].map((file) => chunks.get(file))), files: [...initial] },
  totalJS: total([...chunks.values()]),
  css,
  html: { raw: Buffer.byteLength(html), gzip: gzipSync(html).length },
  chunks: [...chunks.values()].map((chunk) => ({ ...chunk, initial: initial.has(chunk.file) })),
}, null, 2))
