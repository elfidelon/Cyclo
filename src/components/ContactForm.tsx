import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { EMAIL_RE, LIMITS, looksLikeCode, sanitizeForSend, sanitizeInput, SanitizeField } from '../lib/sanitize'

type Channel = 'whatsapp' | 'email'
type Field = 'nombre' | 'contacto' | 'proceso'
type Status = 'idle' | 'sending' | 'sent' | 'failed'

const EMAIL_ADDRESS = 'hola@cyclo.mx'
const WHATSAPP_NUMBER = '524776191070'
// Webhook del workflow "Cyclo · Leads de la web" en n8n cloud. Se define al compilar
// (VITE_N8N_WEBHOOK_URL, ver vite.config.ts) y es el único origen al que la página
// puede mandar datos según su Content-Security-Policy.
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL
const TIMEOUT_MS = 12000
// Antispam del lado del navegador. El webhook vuelve a validar todo.
const MIN_FILL_MS = 3000
const COOLDOWN_MS = 60_000
const LAST_SENT_KEY = 'cyclo:ultimo-envio'

const SECTORS = [
  'Clínica dental',
  'Consultorio médico',
  'Inmobiliaria',
  'Despacho contable',
  'Agencia de servicios',
  'Comercio',
  'Otro',
]

const REMOVED_HINT: Record<SanitizeField, string> = {
  nombre: 'Solo letras, espacios, puntos y guiones.',
  empresa: 'Quitamos símbolos que no van en el nombre de un negocio.',
  telefono: 'Solo números; puedes usar espacios, + y guiones.',
  email: 'Ese carácter no va en un correo.',
  proceso: 'Quitamos símbolos de código como < > { } [ ]. Escribe en texto normal.',
}

const inputBase =
  'w-full rounded-xl bg-sunken px-4 py-3 text-[1rem] text-fg ring-1 ring-inset ring-line placeholder:text-faint transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-text'

function readLastSent(): number {
  try {
    return Number(window.localStorage.getItem(LAST_SENT_KEY)) || 0
  } catch {
    return 0
  }
}

function writeLastSent() {
  try {
    window.localStorage.setItem(LAST_SENT_KEY, String(Date.now()))
  } catch {
    // Sin almacenamiento (modo privado): el límite solo aplica en el webhook.
  }
}

function Hint({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[0.82rem] text-muted">
      {children}
    </p>
  )
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[0.85rem] text-[#f2a28c]">
      {children}
    </p>
  )
}

export default function ContactForm() {
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sector, setSector] = useState('')
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('')
  const [removed, setRemoved] = useState<Partial<Record<SanitizeField, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [sentName, setSentName] = useState('')
  const shownAt = useRef(Date.now())
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    contacto: useRef<HTMLInputElement>(null),
    proceso: useRef<HTMLTextAreaElement>(null),
  }

  useEffect(() => {
    if (status === 'idle') shownAt.current = Date.now()
  }, [status])

  function bind(field: SanitizeField, setter: (v: string) => void) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, removed: cut } = sanitizeInput(field, e.target.value)
      setter(value)
      setRemoved((prev) => (prev[field] === cut ? prev : { ...prev, [field]: cut }))
    }
  }

  const contactField: SanitizeField = channel === 'whatsapp' ? 'telefono' : 'email'

  function validate(): Partial<Record<Field, string>> {
    const e: Partial<Record<Field, string>> = {}
    const n = sanitizeForSend('nombre', name)
    if (!n) e.nombre = 'Escribe tu nombre.'
    else if (n.length < 2) e.nombre = 'Escribe tu nombre completo.'

    if (channel === 'whatsapp') {
      const digits = sanitizeForSend('telefono', phone)
      if (!digits) e.contacto = 'Escribe tu número de WhatsApp.'
      else if (digits.length < 10 || digits.length > 15) e.contacto = 'El número debe tener entre 10 y 15 dígitos.'
    } else {
      const m = sanitizeForSend('email', email)
      if (!m) e.contacto = 'Escribe tu correo.'
      else if (!EMAIL_RE.test(m)) e.contacto = 'Revisa el correo: falta la @ o el dominio.'
    }

    const p = sanitizeForSend('proceso', message)
    if (!p) e.proceso = 'Cuéntanos qué proceso te quita más tiempo.'
    else if (p.length < 10) e.proceso = 'Cuéntanos un poco más, con al menos 10 caracteres.'

    if (!e.proceso && [name, company, message].some(looksLikeCode)) {
      e.proceso = 'Escribe tu mensaje en texto normal, sin código ni comandos.'
    }
    return e
  }

  function payload() {
    return {
      nombre: sanitizeForSend('nombre', name),
      empresa: sanitizeForSend('empresa', company) || null,
      telefono: channel === 'whatsapp' ? sanitizeForSend('telefono', phone) : null,
      email: channel === 'email' ? sanitizeForSend('email', email).toLowerCase() : null,
      canal: channel,
      sector: SECTORS.includes(sector) ? sector : null,
      proceso: sanitizeForSend('proceso', message),
    }
  }

  function summary() {
    const d = payload()
    return [
      `Hola, soy ${d.nombre}${d.empresa ? ` de ${d.empresa}` : ''}.`,
      d.sector ? `Giro: ${d.sector}.` : null,
      `Quiero automatizar: ${d.proceso}`,
      d.email ? `Mi correo: ${d.email}` : null,
      d.telefono ? `Mi WhatsApp: ${d.telefono}` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  function fakeSuccess() {
    setSentName('')
    setStatus('sent')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setFormError('')

    // Un bot llena el campo trampa. Le mostramos éxito para que no reintente, pero no se envía nada.
    if (trap) {
      fakeSuccess()
      return
    }

    const found = validate()
    setErrors(found)
    const first = (['nombre', 'contacto', 'proceso'] as Field[]).find((f) => found[f])
    if (first) {
      refs[first].current?.focus()
      return
    }

    // Nadie llena un formulario válido en menos de 3 segundos; un script sí.
    if (Date.now() - shownAt.current < MIN_FILL_MS) {
      fakeSuccess()
      return
    }

    if (Date.now() - readLastSent() < COOLDOWN_MS) {
      setFormError('Ya recibimos un mensaje tuyo hace un momento. Espera un minuto o escríbenos directo por WhatsApp.')
      return
    }

    setStatus('sending')
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const data = payload()
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'strict-origin',
        signal: ctrl.signal,
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Webhook respondió ${res.status}`)
      writeLastSent()
      setSentName(data.nombre.split(' ')[0])
      setStatus('sent')
      setName('')
      setCompany('')
      setPhone('')
      setEmail('')
      setSector('')
      setMessage('')
      setRemoved({})
    } catch {
      setStatus('failed')
    } finally {
      window.clearTimeout(timer)
    }
  }

  function describedBy(f: Field, sf: SanitizeField) {
    const ids = [errors[f] ? `${f}-error` : null, removed[sf] ? `${sf}-hint` : null, f === 'proceso' ? 'proceso-count' : null]
    return ids.filter(Boolean).join(' ') || undefined
  }

  function fieldProps(f: Field, sf: SanitizeField) {
    return {
      'aria-invalid': errors[f] ? true : undefined,
      'aria-describedby': describedBy(f, sf),
      onBlur: () => {
        if (errors[f]) setErrors((prev) => ({ ...prev, [f]: validate()[f] }))
      },
    }
  }

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary())}`
  const mailLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent('Diagnóstico para mi negocio')}&body=${encodeURIComponent(summary())}`

  return (
    <div className="rounded-2xl bg-bg p-6 text-fg sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'sent' ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[420px] flex-col justify-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-deep">
              <Check className="h-6 w-6 text-teal-text" aria-hidden="true" />
            </span>
            <p className="mt-6 text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">
              Recibido{sentName ? `, ${sentName}` : ''}.
            </p>
            <p className="mt-3 max-w-[42ch] text-muted">
              Te escribimos por {channel === 'whatsapp' ? 'WhatsApp' : 'correo'} en menos de 24 horas con una primera idea y
              una fecha para el diagnóstico.
            </p>
            <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-8 w-fit">
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            autoComplete="on"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col gap-5"
          >
            {/* Campo trampa: invisible para personas y lectores de pantalla; los bots lo llenan. */}
            <div aria-hidden="true" className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden">
              <label htmlFor="cf-hp">No llenes este campo</label>
              <input
                id="cf-hp"
                name="cf-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            <fieldset>
              <legend className="text-[0.92rem] font-semibold">¿Por dónde te contactamos?</legend>
              <div className="mt-2.5 inline-flex rounded-full bg-sunken p-1 ring-1 ring-inset ring-line">
                {(['whatsapp', 'email'] as Channel[]).map((c) => (
                  <label
                    key={c}
                    className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full px-4 text-[0.92rem] font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-text ${
                      channel === c ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
                    }`}
                  >
                    <input
                      type="radio"
                      name="canal"
                      value={c}
                      checked={channel === c}
                      onChange={() => {
                        setChannel(c)
                        setErrors((prev) => ({ ...prev, contacto: undefined }))
                      }}
                      className="sr-only"
                    />
                    {c === 'whatsapp' ? (
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    )}
                    {c === 'whatsapp' ? 'WhatsApp' : 'Correo'}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-nombre" className="text-[0.92rem] font-semibold">
                  Nombre <span className="font-normal text-faint">(obligatorio)</span>
                </label>
                <input
                  ref={refs.nombre}
                  id="cf-nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  maxLength={LIMITS.nombre}
                  spellCheck={false}
                  value={name}
                  onChange={bind('nombre', setName)}
                  placeholder="Mariana López"
                  className={`${inputBase} mt-2`}
                  {...fieldProps('nombre', 'nombre')}
                />
                {errors.nombre && <ErrorText id="nombre-error">{errors.nombre}</ErrorText>}
                {removed.nombre && <Hint id="nombre-hint">{REMOVED_HINT.nombre}</Hint>}
              </div>
              <div>
                <label htmlFor="cf-empresa" className="text-[0.92rem] font-semibold">
                  Negocio
                </label>
                <input
                  id="cf-empresa"
                  name="empresa"
                  type="text"
                  autoComplete="organization"
                  maxLength={LIMITS.empresa}
                  value={company}
                  onChange={bind('empresa', setCompany)}
                  placeholder="Clínica Sonrisa"
                  aria-describedby={removed.empresa ? 'empresa-hint' : undefined}
                  className={`${inputBase} mt-2`}
                />
                {removed.empresa && <Hint id="empresa-hint">{REMOVED_HINT.empresa}</Hint>}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-contacto" className="text-[0.92rem] font-semibold">
                  {channel === 'whatsapp' ? 'WhatsApp' : 'Correo'} <span className="font-normal text-faint">(obligatorio)</span>
                </label>
                <input
                  ref={refs.contacto}
                  id="cf-contacto"
                  name={channel === 'whatsapp' ? 'telefono' : 'email'}
                  type={channel === 'whatsapp' ? 'tel' : 'email'}
                  inputMode={channel === 'whatsapp' ? 'tel' : 'email'}
                  autoComplete={channel === 'whatsapp' ? 'tel' : 'email'}
                  maxLength={LIMITS[contactField]}
                  value={channel === 'whatsapp' ? phone : email}
                  onChange={channel === 'whatsapp' ? bind('telefono', setPhone) : bind('email', setEmail)}
                  placeholder={channel === 'whatsapp' ? '477 123 4567' : 'tu@negocio.com'}
                  className={`${inputBase} mt-2`}
                  {...fieldProps('contacto', contactField)}
                />
                {errors.contacto && <ErrorText id="contacto-error">{errors.contacto}</ErrorText>}
                {removed[contactField] && <Hint id={`${contactField}-hint`}>{REMOVED_HINT[contactField]}</Hint>}
              </div>
              <div>
                <label htmlFor="cf-sector" className="text-[0.92rem] font-semibold">
                  Giro
                </label>
                <div className="relative mt-2">
                  <select
                    id="cf-sector"
                    name="sector"
                    value={sector}
                    onChange={(e) => setSector(SECTORS.includes(e.target.value) ? e.target.value : '')}
                    className={`${inputBase} appearance-none pr-11 ${sector ? '' : 'text-faint'}`}
                  >
                    <option value="">Elige uno</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s} className="text-fg">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="cf-proceso" className="text-[0.92rem] font-semibold">
                  ¿Qué proceso te quita más tiempo? <span className="font-normal text-faint">(obligatorio)</span>
                </label>
                <span id="proceso-count" className="mono tabular shrink-0 text-[0.75rem] text-faint">
                  {message.length}/{LIMITS.proceso}
                </span>
              </div>
              <textarea
                ref={refs.proceso}
                id="cf-proceso"
                name="proceso"
                rows={4}
                maxLength={LIMITS.proceso}
                value={message}
                onChange={bind('proceso', setMessage)}
                placeholder="Ej. Contestar por WhatsApp a quién le toca cita y confirmarlas una por una."
                className={`${inputBase} mt-2 resize-y`}
                {...fieldProps('proceso', 'proceso')}
              />
              {errors.proceso && <ErrorText id="proceso-error">{errors.proceso}</ErrorText>}
              {removed.proceso && <Hint id="proceso-hint">{REMOVED_HINT.proceso}</Hint>}
            </div>

            {formError && (
              <p role="alert" className="rounded-xl bg-sunken p-4 text-[0.92rem] text-fg ring-1 ring-inset ring-line">
                {formError}
              </p>
            )}

            {status === 'failed' && (
              <div role="alert" className="rounded-xl bg-sunken p-4 ring-1 ring-inset ring-[#f2a28c]/50">
                <p className="font-semibold text-fg">No se pudo enviar el formulario.</p>
                <p className="mt-1 text-[0.92rem] text-muted">
                  Tus datos siguen aquí. Mándanos el mismo mensaje directo, ya va escrito:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !min-h-[44px] text-[0.92rem]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Enviar por WhatsApp
                  </a>
                  <a href={mailLink} className="btn-secondary !min-h-[44px] text-[0.92rem]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Enviar por correo
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={status === 'sending'} className="btn-primary w-fit disabled:opacity-60">
                {status === 'sending' ? 'Enviando…' : 'Pedir mi diagnóstico'}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg">
                  <ArrowRight className="h-4 w-4 text-fg" aria-hidden="true" />
                </span>
              </button>
              <p className="max-w-[30ch] text-[0.8rem] leading-snug text-faint">
                Este formulario también es un flujo de Cyclo: al enviarlo nos llega un WhatsApp con tus datos.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
