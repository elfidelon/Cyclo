// Rollup informa qué módulos acaban realmente en cada chunk. renderedLength es
// tamaño previo a minificar; para bytes transferidos usar measure-build.mjs.
import { build } from 'vite'

const { output } = await build({ logLevel: 'silent', build: { write: false } })
console.log(JSON.stringify(output.filter((item) => item.type === 'chunk').map((chunk) => ({
  file: chunk.fileName,
  imports: chunk.imports,
  dynamicImports: chunk.dynamicImports,
  modules: Object.entries(chunk.modules)
    .filter(([, module]) => module.renderedLength > 0)
    .map(([id, module]) => ({ id: id.replace(`${process.cwd()}/`, ''), renderedLength: module.renderedLength }))
    .sort((a, b) => b.renderedLength - a.renderedLength),
})), null, 2))
