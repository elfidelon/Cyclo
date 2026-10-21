import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

/** HTML de la página en el build, para que se vea antes de que cargue el JavaScript. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
