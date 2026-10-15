/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Siempre definida: vite.config.ts pone un valor por defecto.
  readonly VITE_N8N_WEBHOOK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
