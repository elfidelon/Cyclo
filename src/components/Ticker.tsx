// Cinta de la bitácora entre el hero y la noche: los mismos casos de la demo, en loop.
// Es decorativa (la información completa está en "Una noche cualquiera en León").
const ITEMS = [
  '23:47 · Clínica dental · cita agendada en 71 s',
  '22:05 · Inmobiliaria · prospecto calificado, visita el sábado',
  '21:30 · Despacho contable · 3 facturas archivadas',
  '00:32 · Consultorio · urgencia pasada a la doctora',
  '20:40 · Agencia · propuesta enviada en PDF',
  '22:41 · Comercio · pedido apartado',
  '06:30 · Recordatorios · citas del día confirmadas',
]

export default function Ticker() {
  return (
    <div aria-hidden="true" className="ticker relative overflow-hidden border-y border-line bg-bg py-4">
      <div className="ticker-track mono flex w-max text-[0.85rem] text-muted">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {ITEMS.map((t) => (
              <span key={t} className="flex items-center gap-8 whitespace-nowrap pr-8">
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-teal-text" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
