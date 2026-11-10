import { looksLikeCode, sanitizeForSend, telefonoMxValido } from '../lib/sanitize'

const WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL
const MIN_FILL_MS = 1500
const TIMEOUT_MS = 12000
const CONSULTAS = ['No sé', 'Menos de 50', '50 a 100', '100 a 300', 'Más de 300']
const number = new Intl.NumberFormat('es-MX')
const pesos = (value: number) => `$${number.format(value)}`

const consultas = document.querySelector<HTMLInputElement>('#consultas')!
const venta = document.querySelector<HTMLInputElement>('#venta')!

function updateCalculator() {
  const count = Number(consultas.value)
  const amount = Number(venta.value)
  document.querySelector('[data-consultas]')!.textContent = number.format(count)
  document.querySelector('[data-venta]')!.textContent = pesos(amount)
  document.querySelector('[data-esperan]')!.textContent = number.format(Math.round(count * 0.35))
  document.querySelector('[data-ganancia]')!.textContent = `+${pesos(amount)}`
  consultas.setAttribute('aria-valuetext', `${number.format(count)} consultas al mes`)
  venta.setAttribute('aria-valuetext', pesos(amount))
  for (const input of [consultas, venta]) {
    const fill = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100
    input.style.setProperty('--fill', `${fill}%`)
  }
}
consultas.addEventListener('input', updateCalculator)
venta.addEventListener('input', updateCalculator)
updateCalculator()

type Field = HTMLInputElement | HTMLSelectElement
const form = document.querySelector<HTMLFormElement>('form[data-lead]')!
const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
const fail = form.querySelector<HTMLElement>('[data-fail]')!
const wa = form.querySelector<HTMLAnchorElement>('[data-wa]')!
const done = document.querySelector<HTMLElement>('[data-done]')!
const label = button.textContent ?? ''
const shownAt = Date.now()
let sending = false

function value(name: string) {
  return (form.elements.namedItem(name) as Field).value
}

function setError(name: string, message: string) {
  const input = form.elements.namedItem(name) as Field
  const box = document.getElementById(`${input.id}-error`)
  if (!box) return
  box.textContent = message
  box.hidden = !message
  if (message) input.setAttribute('aria-invalid', 'true')
  else input.removeAttribute('aria-invalid')
}

function readForm() {
  const selected = value('consultas')
  const monthly = CONSULTAS.includes(selected) ? selected : 'No sé'
  const measure = (form.elements.namedItem('medir') as HTMLInputElement).checked ? 'sí' : 'no'
  // El servidor solo acepta estos siete campos. La selección y el permiso van en proceso.
  return {
    nombre: sanitizeForSend('nombre', value('nombre')),
    empresa: sanitizeForSend('empresa', value('empresa')),
    telefono: sanitizeForSend('telefono', value('telefono')),
    email: null,
    canal: 'whatsapp',
    sector: 'Inmobiliaria',
    proceso: sanitizeForSend('proceso', `Página de inmobiliarias. Consultas al mes: ${monthly}. Medir respuesta: ${measure}.`),
  }
}

type Lead = ReturnType<typeof readForm>

function validate(lead: Lead) {
  const errors: Record<string, string> = {}
  if (lead.nombre.length < 2) errors.nombre = 'Escribe tu nombre.'
  else if (looksLikeCode(lead.nombre)) errors.nombre = 'Escríbelo en texto normal.'
  if (!lead.empresa) errors.empresa = 'Escribe el nombre de tu inmobiliaria.'
  else if (looksLikeCode(lead.empresa)) errors.empresa = 'Escríbelo en texto normal.'
  if (!lead.telefono) errors.telefono = 'Escribe tu WhatsApp.'
  else if (!telefonoMxValido(lead.telefono)) errors.telefono = 'Revisa el número: son 10 dígitos con lada.'
  return errors
}

function finish(firstName: string) {
  form.hidden = true
  done.hidden = false
  done.querySelector('[data-name]')!.textContent = firstName
  done.focus({ preventScroll: true })
  done.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (sending) return
  fail.hidden = true
  const lead = readForm()
  const firstName = lead.nombre.split(' ')[0]
  // Misma protección que en /unete/: los envíos automáticos ven éxito sin mandar datos.
  if (value('hp') || Date.now() - shownAt < MIN_FILL_MS) {
    finish(firstName)
    return
  }
  const errors = validate(lead)
  const fields = ['nombre', 'empresa', 'telefono']
  fields.forEach((name) => setError(name, errors[name] ?? ''))
  const first = fields.find((name) => errors[name])
  if (first) {
    ;(form.elements.namedItem(first) as Field).focus()
    return
  }

  sending = true
  button.disabled = true
  button.textContent = 'Enviando…'
  form.setAttribute('aria-busy', 'true')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'strict-origin',
      signal: controller.signal,
      body: JSON.stringify(lead),
    })
    if (!response.ok) throw new Error(`Webhook respondió ${response.status}`)
    finish(firstName)
  } catch {
    const message = `Hola, soy ${lead.nombre} de ${lead.empresa}. Mi WhatsApp es ${lead.telefono}. Quiero agendar mi diagnóstico. ${lead.proceso}`
    wa.href = `https://wa.me/524951024002?text=${encodeURIComponent(message)}`
    fail.hidden = false
  } finally {
    window.clearTimeout(timer)
    sending = false
    button.disabled = false
    button.textContent = label
    form.removeAttribute('aria-busy')
  }
})

form.addEventListener('input', (event) => {
  const name = (event.target as Field).name
  if (name) setError(name, '')
})
