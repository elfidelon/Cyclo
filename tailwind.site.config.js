import shared from './tailwind.config.js'

// La portada no necesita las utilidades de las páginas claras ni de los QR.
// Conserva exactamente los mismos tokens, plugins y orden de las reglas compartidas.
export default {
  ...shared,
  content: ['./index.html', './src/App.tsx', './src/components/**/*.{ts,tsx}', './src/demo/GiroIcon.tsx'],
}
