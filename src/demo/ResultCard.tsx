import { BellRing, CreditCard, FileText, FolderOpen, Users } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import type { Result } from './data'

// Lo que el sistema deja listo, dibujado como lo verías en cada herramienta.

function Source({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-slate-500">{children}</p>
}

export default function ResultCard({ result }: { result: Result }) {
  const base = 'rounded-2xl bg-white p-4 text-slate-900 shadow-[0_2px_8px_rgb(0_0_0/0.08)] sm:p-5'

  if (result.type === 'calendar') {
    const [dia, hora] = result.when.split(' · ')
    return (
      <div className={base}>
        <Source>
          <BrandLogo brand="googlecalendar" className="h-3.5 w-3.5" />
          Google Calendar · cita creada
        </Source>
        <div className="mt-3 flex items-stretch gap-4">
          <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--soft)] px-2 py-2 text-center text-[color:var(--accent)]">
            <span className="text-[0.72rem] font-bold uppercase">{dia}</span>
            <span className="mono tabular text-[1.05rem] font-bold leading-tight">{hora?.split(' – ')[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[1.05rem] font-bold leading-snug">{result.title}</p>
            <p className="mono tabular mt-0.5 text-[0.82rem] text-slate-600">{result.when}</p>
            <p className="mt-1 text-[0.88rem] text-slate-700">{result.detail}</p>
          </div>
        </div>
      </div>
    )
  }

  if (result.type === 'sheet') {
    return (
      <div className={base}>
        <Source>
          <BrandLogo brand="googlesheets" className="h-3.5 w-3.5" />
          Google Sheets · {result.title}
        </Source>
        <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-slate-200">
          <table className="w-full text-left text-[0.82rem]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {result.columns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[var(--soft)] font-semibold text-slate-900">
                {result.row.map((c, i) => (
                  <td key={i} className="px-3 py-2">
                    {c}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[0.75rem] font-semibold text-[color:var(--accent)]">Fila nueva</p>
      </div>
    )
  }

  if (result.type === 'reminder') {
    return (
      <div className={base}>
        <Source>
          <BellRing aria-hidden="true" className="h-3.5 w-3.5" />
          Recordatorio programado
        </Source>
        <p className="mt-2 text-[1rem] font-bold">{result.when}</p>
        <p className="mt-2 rounded-xl rounded-tl-sm bg-[#e8f7e3] px-3 py-2 text-[0.88rem] leading-snug text-slate-800">{result.text}</p>
      </div>
    )
  }

  if (result.type === 'file') {
    const pdf = result.name.toLowerCase().endsWith('.pdf')
    return (
      <div className={base}>
        <Source>
          {pdf ? (
            <FileText aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <BrandLogo brand="googledrive" className="h-3.5 w-3.5" />
          )}
          {pdf ? 'Documento generado' : 'Google Drive · archivado'}
        </Source>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--soft)] text-[color:var(--accent)]">
            {pdf ? <FileText aria-hidden="true" className="h-5 w-5" /> : <FolderOpen aria-hidden="true" className="h-5 w-5" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.98rem] font-bold">{result.name}</span>
            <span className="block text-[0.85rem] text-slate-600">{result.detail}</span>
          </span>
        </div>
      </div>
    )
  }

  if (result.type === 'crm') {
    return (
      <div className={base}>
        <Source>
          <Users aria-hidden="true" className="h-3.5 w-3.5" />
          CRM · prospecto calificado
        </Source>
        <p className="mt-2 text-[1rem] font-bold">{result.name}</p>
        <p className="mt-2 inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-[0.8rem] font-bold text-white">{result.status}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {result.tags.map((t) => (
            <li key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.78rem] text-slate-700">
              {t}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={base}>
      <Source>
        <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />
        Link de pago enviado
      </Source>
      <p className="mono tabular mt-2 text-[1.8rem] font-bold leading-none tracking-[-0.02em] text-[color:var(--accent)]">{result.amount}</p>
      <p className="mt-1.5 text-[0.88rem] text-slate-700">{result.detail}</p>
    </div>
  )
}
