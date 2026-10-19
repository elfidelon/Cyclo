import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Logo from '../Logo'
import AgentChat from './AgentChat'
import AgentTrace from './AgentTrace'
import { useAgent } from './AgentProvider'
import { lockScroll } from '../../lib/smooth'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Botón flotante que abre el chat en un <dialog> nativo (atrapa el foco, cierra con Esc
 * y devuelve el foco al botón). Se esconde en el hero y cuando la sección del agente o el
 * formulario de contacto están en pantalla (y en las demos y el footer, para no tapar el contenido).
 */
export default function AgentLauncher() {
  const { status, trace } = useAgent()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let pastHero = false
    let covered = false
    const onScreen = new Set<Element>()
    const update = () => setVisible(pastHero && !covered)
    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.75
      update()
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)))
        covered = onScreen.size > 0
        update()
      },
      { threshold: 0.12 },
    )
    ;['demos', 'agente', 'contacto', 'pie'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => {
      setOpen(false)
      lockScroll(false)
    }
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  function show() {
    dialogRef.current?.showModal()
    setOpen(true)
    lockScroll(true)
  }

  const sending = status === 'sending'

  return (
    <>
      <AnimatePresence>
        {visible && !open && (
          <motion.button
            type="button"
            onClick={show}
            aria-haspopup="dialog"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed bottom-4 right-4 z-float flex min-h-[56px] items-center gap-3 rounded-full bg-fg py-2 pl-2 pr-5 font-semibold text-bg shadow-[0_4px_8px_rgb(0_0_0/0.35)] transition-colors hover:bg-white sm:bottom-6 sm:right-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg">
              <Logo className="h-5 w-5" />
            </span>
            <span className="text-[0.95rem]">
              <span className="sm:hidden">Pregúntale</span>
              <span className="hidden sm:inline">Pregúntale al agente</span>
            </span>
            <span aria-hidden="true" className={`h-2 w-2 rounded-full bg-teal ${sending ? 'live-dot' : ''}`} />
          </motion.button>
        )}
      </AnimatePresence>

      <dialog
        ref={dialogRef}
        aria-labelledby="agente-dialogo-titulo"
        className="agent-drawer"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close()
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 bg-[#10201f] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg">
                <Logo className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span id="agente-dialogo-titulo" className="block text-[0.95rem] font-semibold text-fg">
                  Agente de Cyclo
                </span>
                <span className="block text-[0.75rem] text-teal-text">{sending ? 'escribiendo…' : 'en línea'}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar el chat"
              className="flex h-11 w-11 items-center justify-center rounded-full text-fg ring-1 ring-inset ring-line transition-colors hover:bg-raised"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <AgentChat variant="drawer" autoFocus={open} />
          </div>

          <details className="group border-t border-line bg-raised">
            <summary className="mono flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 text-[0.78rem] text-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
              <span>
                Lo que pasa detrás <span className="tabular">· {trace.length} pasos</span>
              </span>
              <span aria-hidden="true" className="transition-transform duration-300 group-open:rotate-90">
                ›
              </span>
            </summary>
            <div className="h-64 border-t border-line">
              <AgentTrace variant="drawer" />
            </div>
          </details>
        </div>
      </dialog>
    </>
  )
}
