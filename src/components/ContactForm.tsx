import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'

type Channel = 'whatsapp' | 'email'

const WHATSAPP_NUMBER = '524776191070'
const EMAIL_ADDRESS = 'hola@cyclo.mx'

export default function ContactForm() {
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!name.trim() || !message.trim()) {
      setError('Cuéntanos tu nombre y qué proceso quieres automatizar.')
      return
    }
    if (channel === 'email' && !email.trim()) {
      setError('Necesitamos tu correo para responderte por email.')
      return
    }
    if (channel === 'whatsapp' && !phone.trim()) {
      setError('Necesitamos tu número para responderte por WhatsApp.')
      return
    }
    setError('')

    const body = [
      `Nombre: ${name}`,
      phone ? `Teléfono: ${phone}` : null,
      email ? `Email: ${email}` : null,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`, '_blank')
    } else {
      const subject = encodeURIComponent('Nueva consulta desde cyclo.mx')
      window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${encodeURIComponent(body)}`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#101010] rounded-2xl p-6 sm:p-8">
      <div className="flex gap-2">
        {(['whatsapp', 'email'] as Channel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
              channel === c ? 'bg-primary text-black' : 'bg-black/40 text-gray-400'
            }`}
          >
            {c === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {c === 'whatsapp' ? 'WhatsApp' : 'Email'}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-name" className="text-xs text-gray-400">
            Nombre
          </label>
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="bg-black/40 rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-contact" className="text-xs text-gray-400">
            {channel === 'whatsapp' ? 'Teléfono' : 'Correo'}
          </label>
          <input
            id="cf-contact"
            type={channel === 'whatsapp' ? 'tel' : 'email'}
            value={channel === 'whatsapp' ? phone : email}
            onChange={(e) => (channel === 'whatsapp' ? setPhone(e.target.value) : setEmail(e.target.value))}
            placeholder={channel === 'whatsapp' ? '10 dígitos' : 'tu@empresa.com'}
            className="bg-black/40 rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-message" className="text-xs text-gray-400">
          ¿Qué proceso quieres automatizar?
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe el proceso que más tiempo consume en tu operación..."
          rows={4}
          className="bg-black/40 rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.98 }}
        className="group inline-flex items-center justify-center gap-2 hover:gap-3 transition-[gap] bg-primary rounded-full pl-5 pr-1.5 py-1.5 w-fit"
      >
        <span className="text-black font-medium text-sm">
          Enviar por {channel === 'whatsapp' ? 'WhatsApp' : 'email'}
        </span>
        <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 transition-transform group-hover:scale-110">
          <ArrowRight className="w-4 h-4 text-[#E1E0CC]" />
        </span>
      </motion.button>
    </form>
  )
}
