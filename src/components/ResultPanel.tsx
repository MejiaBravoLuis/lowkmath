import { useState } from 'react'
import { alphabetSize } from '../engine/count.ts'
import { explain, procedureText, restrictionsList, termExpr, termLabel } from '../engine/explain.ts'
import { fmt, sci } from '../engine/format.ts'
import type { ReactNode } from 'react'
import type { Config, CountResult } from '../engine/types.ts'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 py-3">
      <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
        {n}
      </span>
      <div className="min-w-0">
        <h4 className="mb-1 text-sm font-semibold">{title}</h4>
        <div className="space-y-1 text-sm text-black/80">{children}</div>
      </div>
    </li>
  )
}

const Mono = ({ children }: { children: ReactNode }) => (
  <p className="overflow-x-auto rounded bg-black/[0.04] px-2.5 py-1.5 font-mono text-[13px]">{children}</p>
)

export default function ResultPanel({ config, result }: { config: Config; result: CountResult }) {
  const [copied, setCopied] = useState(false)
  const e = explain(config, result)
  const restr = restrictionsList(config)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(procedureText(config, result))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* sin portapapeles disponible */
    }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white">
      <div className="border-b border-black/10 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-black/60">Contraseñas posibles</p>
        <p className="mt-1 break-all font-mono text-2xl font-semibold tabular-nums text-accent sm:text-3xl">
          {fmt(result.total)}
        </p>
        <p className="mt-1 text-sm text-black/60">
          ≈ {sci(result.total)} · {alphabetSize(config)} caracteres · longitud {config.length} ·{' '}
          {config.repetition ? 'con' : 'sin'} repetición
          {restr.length > 0 && ` · ${restr.join(', ')}`}
        </p>
      </div>

      <ol className="divide-y divide-black/5 px-5">
        <Step n={1} title="Opciones por posición">
          <div className="flex flex-wrap gap-1.5">
            {e.positions.map((o, i) => (
              <span key={i} className="flex flex-col items-center rounded border border-black/10 px-2 py-1 font-mono text-xs">
                <span className="text-[10px] text-black/40">{i + 1}</span>
                {o}
              </span>
            ))}
          </div>
          {result.required.length > 0 && (
            <p className="text-xs text-black/60">
              Se muestran las opciones del total; cada complemento se calcula igual, excluyendo esas clases.
            </p>
          )}
        </Step>
        <Step n={2} title="Principio aplicado">
          <p>{e.principle}</p>
        </Step>
        <Step n={3} title="Fórmula">
          <Mono>{e.formula}</Mono>
        </Step>
        <Step n={4} title="Sustitución">
          {e.substitution.map((l, i) => <Mono key={i}>{l}</Mono>)}
          {result.terms.length > 1 && (
            <ul className="mt-2 space-y-0.5 text-xs text-black/70">
              {result.terms.map((t, i) => (
                <li key={i}>
                  <span className="font-mono">{i === 0 ? ' ' : t.sign === 1 ? '+' : '−'}</span>{' '}
                  {termLabel(t, result.required)}: <span className="font-mono">{termExpr(t, config.repetition)}</span> ={' '}
                  <span className="font-mono">{fmt(t.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Step>
        <Step n={5} title="Resultado">
          <Mono>{e.result}</Mono>
        </Step>
        <Step n={6} title="Interpretación">
          {e.interpretation.map((l, i) => <p key={i}>{l}</p>)}
        </Step>
      </ol>

      <div className="border-t border-black/10 p-3 text-right">
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
        >
          {copied ? 'Copiado ✓' : 'Copiar procedimiento'}
        </button>
      </div>
    </div>
  )
}
