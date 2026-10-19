/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Siempre definidas: vite.config.ts pone valores por defecto.
  readonly VITE_N8N_WEBHOOK_URL: string
  readonly VITE_N8N_AGENT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
