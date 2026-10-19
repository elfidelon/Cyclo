import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Webhook del formulario (workflow "Cyclo · Leads de la web" en n8n cloud). Se puede
// sobrescribir con la variable VITE_N8N_WEBHOOK_URL (en GitHub: Settings → Secrets and
// variables → Actions → Variables).
const DEFAULT_WEBHOOK = 'https://fidelreykaste.app.n8n.cloud/webhook/cyclo-leads'
// Webhook del agente del sitio (workflow "Cyclo · Agente del sitio"). Se sobrescribe con VITE_N8N_AGENT_URL.
const DEFAULT_AGENT = 'https://fidelreykaste.app.n8n.cloud/webhook/cyclo-agente'
// Demos por giro: cada una es su propia página (demos/<giro>.html) para abrirla en otra pestaña.
const DEMOS = ['dental', 'consultorio', 'inmobiliaria', 'contable', 'escuela', 'agencia', 'comercio']

/**
 * GitHub Pages no deja configurar cabeceras HTTP, así que las políticas de seguridad
 * van como <meta> en el HTML final. Solo en el build: en desarrollo Vite usa scripts
 * en línea que esta política bloquearía.
 */
function securityMeta(connectOrigins: string[]): Plugin {
  const csp = [
    "default-src 'self'",
    // Solo los scripts del propio sitio: nada en línea, nada de terceros, nada de eval.
    "script-src 'self'",
    // framer-motion y React escriben estilos en línea; las hojas solo de aquí y Google Fonts.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data:",
    // Los únicos lugares a los que la página puede mandar datos: el formulario y el agente.
    `connect-src ${connectOrigins.join(' ')}`,
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

  return {
    name: 'cyclo-security-meta',
    apply: 'build',
    transformIndexHtml() {
      return [
        { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
        { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  const webhook = env.VITE_N8N_WEBHOOK_URL || DEFAULT_WEBHOOK
  const agent = env.VITE_N8N_AGENT_URL || DEFAULT_AGENT

  const originOf = (name: string, value: string) => {
    try {
      const url = new URL(value)
      if (mode === 'production' && url.protocol !== 'https:') {
        throw new Error('debe usar https en producción')
      }
      return url.origin
    } catch (err) {
      throw new Error(`${name} inválida (${value}): ${(err as Error).message}`)
    }
  }
  const origins = [originOf('VITE_N8N_WEBHOOK_URL', webhook)]
  const agentOrigin = originOf('VITE_N8N_AGENT_URL', agent)
  if (origins.indexOf(agentOrigin) === -1) origins.push(agentOrigin)

  return {
    plugins: [react(), securityMeta(origins)],
    base: '/Cyclo/',
    define: {
      'import.meta.env.VITE_N8N_WEBHOOK_URL': JSON.stringify(webhook),
      'import.meta.env.VITE_N8N_AGENT_URL': JSON.stringify(agent),
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        input: DEMOS.reduce<Record<string, string>>(
          (acc, slug) => {
            acc[`demos/${slug}`] = `demos/${slug}.html`
            return acc
          },
          { main: 'index.html' },
        ),
      },
    },
  }
})
