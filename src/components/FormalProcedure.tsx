import { useState } from 'react'
import type { ReactNode } from 'react'
import { explain, procedureText, termExpr, termLabel } from '../engine/explain.ts'
import { fmt } from '../engine/format.ts'
import type { Config, CountResult } from '../engine/types.ts'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1.75rem_1fr] gap-x-3 py-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{n}</span>
      <div className="min-w-0">
        <h4 className="mb-1 text-sm font-semibold">{title}</h4>
        <div className="space-y-1 text-sm text-black/80">{children}</div>
      </div>
    </li>
  )
}

const Mono = ({ children }: { children: ReactNode }) => (
  <p className="overflow-x-auto rounded-lg bg-black/4 px-3 py-2 font-mono text-[13px]">{children}</p>
)

/** Procedimiento en el formato que pide el informe: fórmula, sustitución, resultado, interpretación. */
export default function FormalProcedure({ config, result }: { config: Config; result: CountResult }) {
  const [copied, setCopied] = useState(false)
  const e = explain(config, result)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(procedureText(config, result))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <details className="group rounded-xl border border-black/10 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
        <span>
          Procedimiento formal para el informe
          <span className="block text-xs font-normal text-black/55">Fórmula, sustitución, resultado e interpretación</span>
        </span>
        <span className="text-black/40 transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
      </summary>
      <div className="border-t border-black/10 px-4">
        <ol className="divide-y divide-black/5">
          <Step n={1} title="Opciones por posición">
            <p className="font-mono text-[13px]">{e.positions.join(' · ')}</p>
          </Step>
          <Step n={2} title="Principio aplicado"><p>{e.principle}</p></Step>
          <Step n={3} title="Fórmula"><Mono>{e.formula}</Mono></Step>
          <Step n={4} title="Sustitución">
            {e.substitution.map((l, i) => <Mono key={i}>{l}</Mono>)}
            {result.terms.length > 1 && (
              <ul className="mt-2 space-y-0.5 text-xs text-black/70">
                {result.terms.map((t, i) => (
                  <li key={i}>
                    <span className="inline-block w-3 font-mono">{i === 0 ? '' : t.sign === 1 ? '+' : '−'}</span>{' '}
                    {termLabel(t, result.required)}:{' '}
                    <span className="font-mono">{termExpr(t, config.repetition)}</span> ={' '}
                    <span className="font-mono">{fmt(t.value)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Step>
          <Step n={5} title="Resultado"><Mono>{e.result}</Mono></Step>
          <Step n={6} title="Interpretación">{e.interpretation.map((l, i) => <p key={i}>{l}</p>)}</Step>
        </ol>
        <div className="border-t border-black/10 py-3 text-right">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-black/15 px-3 py-1.5 text-sm transition hover:bg-black/5"
          >
            {copied ? 'Copiado ✓' : 'Copiar procedimiento'}
          </button>
        </div>
      </div>
    </details>
  )
}
