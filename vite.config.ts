import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Webhook del formulario (workflow "Cyclo · Leads de la web" en n8n cloud). Se puede
// sobrescribir con la variable VITE_N8N_WEBHOOK_URL (en GitHub: Settings → Secrets and
// variables → Actions → Variables).
const DEFAULT_WEBHOOK = 'https://fidelreykaste.app.n8n.cloud/webhook/cyclo-leads'

/**
 * GitHub Pages no deja configurar cabeceras HTTP, así que las políticas de seguridad
 * van como <meta> en el HTML final. Solo en el build: en desarrollo Vite usa scripts
 * en línea que esta política bloquearía.
 */
function securityMeta(webhookOrigin: string): Plugin {
  const csp = [
    "default-src 'self'",
    // Solo los scripts del propio sitio: nada en línea, nada de terceros, nada de eval.
    "script-src 'self'",
    // framer-motion y React escriben estilos en línea; las hojas solo de aquí y Google Fonts.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data:",
    // El único lugar al que la página puede mandar datos.
    `connect-src ${webhookOrigin}`,
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

  let origin: string
  try {
    const url = new URL(webhook)
    if (mode === 'production' && url.protocol !== 'https:') {
      throw new Error('el webhook debe usar https en producción')
    }
    origin = url.origin
  } catch (err) {
    throw new Error(`VITE_N8N_WEBHOOK_URL inválida (${webhook}): ${(err as Error).message}`)
  }

  return {
    plugins: [react(), securityMeta(origin)],
    base: '/Cyclo/',
    define: {
      'import.meta.env.VITE_N8N_WEBHOOK_URL': JSON.stringify(webhook),
    },
    build: {
      sourcemap: false,
    },
  }
})
