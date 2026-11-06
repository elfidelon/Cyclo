import { looksLikeCode, sanitizeForSend } from '../lib/sanitize'

// Formularios de las páginas del QR (/demos/ y /unete/). Van al mismo flujo de n8n que el
// formulario del sitio: el webhook solo acepta estos 7 campos y vuelve a validar todo.
// Estas páginas no llevan React para que abran rápido desde un celular con mala señal.
const WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL
const WHATSAPP_NUMBER = '524951024002'
const TIMEOUT_MS = 12000
// Nadie llena esto en menos de 1.5 s, ni con autocompletar; un script sí.
const MIN_FILL_MS = 1500

const SECTORS = [
  'Clínica dental',
  'Consultorio médico',
  'Inmobiliaria',
  'Despacho contable',
  'Escuela privada',
  'Agencia de servicios',
  'Comercio',
  'Otro',
]

// Texto que le llega a Fidel para saber de qué QR vino. El webhook pide 10 caracteres o más.
const ORIGEN: Record<string, string> = {
  demos: 'Llegó por el QR de demos. No encontró su negocio en la lista.',
  unete: 'Llegó por el QR de la presentación. Quiere ser de los primeros.',
}

type Input = HTMLInputElement | HTMLSelectElement

function setError(form: HTMLFormElement, name: string, message: string) {
  const input = form.elements.namedItem(name) as Input | null
  if (!input) return
  const box = document.getElementById(`${input.id}-error`)
  if (box) {
    box.textContent = message
    box.hidden = !message
  }
  if (message) input.setAttribute('aria-invalid', 'true')
  else input.removeAttribute('aria-invalid')
}

function value(form: HTMLFormElement, name: string) {
  return (form.elements.namedItem(name) as Input | null)?.value ?? ''
}

function readForm(form: HTMLFormElement, kind: string) {
  const sector = value(form, 'sector')
  return {
    nombre: sanitizeForSend('nombre', value(form, 'nombre')),
    empresa: sanitizeForSend('empresa', value(form, 'empresa')),
    telefono: sanitizeForSend('telefono', value(form, 'telefono')),
    email: null,
    canal: 'whatsapp',
    sector: kind === 'demos' ? 'Otro' : SECTORS.includes(sector) ? sector : null,
    proceso: ORIGEN[kind],
  }
}

type Lead = ReturnType<typeof readForm>

function validate(lead: Lead, kind: string) {
  const errors: Record<string, string> = {}
  if (lead.nombre.length < 2) errors.nombre = 'Escribe tu nombre.'
  if (!lead.empresa) errors.empresa = kind === 'demos' ? 'Dinos de qué es tu negocio.' : 'Escribe el nombre de tu negocio.'
  else if (looksLikeCode(lead.empresa)) errors.empresa = 'Escríbelo en texto normal.'
  if (!lead.telefono) errors.telefono = 'Escribe tu WhatsApp.'
  else if (lead.telefono.length < 10 || lead.telefono.length > 15) errors.telefono = 'Revisa el número: son 10 dígitos con lada.'
  return errors
}

function whatsappLink(lead: Lead) {
  const text = [
    `Hola, soy ${lead.nombre || '…'}${lead.empresa ? ` de ${lead.empresa}` : ''}.`,
    'Quiero saber más de Cyclo para mi negocio.',
  ].join(' ')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

function setup(form: HTMLFormElement) {
  const kind = form.dataset.lead ?? ''
  const shownAt = Date.now()
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
  const label = button.textContent ?? ''
  const fail = form.querySelector<HTMLElement>('[data-fail]')!
  const wa = form.querySelector<HTMLAnchorElement>('[data-wa]')!
  const done = form.parentElement!.querySelector<HTMLElement>('[data-done]')!
  let sending = false

  function finish(firstName: string) {
    form.hidden = true
    done.hidden = false
    const name = done.querySelector<HTMLElement>('[data-name]')!
    name.textContent = firstName
    done.focus({ preventScroll: true })
    done.scrollIntoView({ block: 'center' })
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sending) return
    fail.hidden = true

    const lead = readForm(form, kind)
    const firstName = lead.nombre.split(' ')[0]

    // Un bot llena el campo trampa o manda en un instante. Ve éxito para que no reintente.
    if (value(form, 'hp') || Date.now() - shownAt < MIN_FILL_MS) {
      finish(firstName)
      return
    }

    const errors = validate(lead, kind)
    ;['nombre', 'empresa', 'telefono'].forEach((f) => setError(form, f, errors[f] ?? ''))
    const first = ['nombre', 'empresa', 'telefono'].find((f) => errors[f])
    if (first) {
      ;(form.elements.namedItem(first) as Input).focus()
      return
    }

    sending = true
    button.disabled = true
    button.textContent = 'Enviando…'
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'strict-origin',
        signal: ctrl.signal,
        body: JSON.stringify(lead),
      })
      if (!res.ok) throw new Error(`Webhook respondió ${res.status}`)
      finish(firstName)
    } catch {
      // Que nunca se pierda: si falla, el botón de WhatsApp lleva sus datos ya escritos.
      wa.href = whatsappLink(lead)
      fail.hidden = false
    } finally {
      window.clearTimeout(timer)
      sending = false
      button.disabled = false
      button.textContent = label
    }
  })

  // Quita el aviso de error en cuanto la persona corrige el campo.
  form.addEventListener('input', (e) => {
    const name = (e.target as Input).name
    if (name) setError(form, name, '')
  })
}

document.querySelectorAll<HTMLFormElement>('form[data-lead]').forEach(setup)

// En /demos/: mientras la persona elige, baja en segundo plano el código de las demos
// para que abran al instante al tocar una.
if (document.querySelector('[data-demos]')) {
  const warm = () => void import('../demo/DemoPage')
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 2500 })
  else setTimeout(warm, 1200)
}
