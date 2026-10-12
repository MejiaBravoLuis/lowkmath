import { plainStory, termLabel } from '../engine/explain.ts'
import { fmt, sci } from '../engine/format.ts'
import type { Config, CountResult } from '../engine/types.ts'

/** Explicación en lenguaje simple + ecuación visual de "total − los que no cumplen". */
export default function Story({ config, result }: { config: Config; result: CountResult }) {
  const lines = plainStory(config, result)
  const multi = result.terms.length > 1

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-black/80">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-black/6 text-[11px] font-bold text-black/55">
              {i + 1}
            </span>
            <span>{l}</span>
          </li>
        ))}
      </ol>

      {multi && (
        <div className="rounded-xl border border-black/10 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">En números</p>
          <div className="flex flex-wrap items-stretch gap-2">
            {result.terms.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-lg font-semibold text-black/40">{t.sign === 1 ? '+' : '−'}</span>}
                <div
                  title={fmt(t.value)}
                  className={`rounded-lg border px-3 py-1.5 ${
                    t.sign === 1 ? 'border-accent/30 bg-accent/5' : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <span className="block text-[11px] text-black/55">{termLabel(t, result.required)}</span>
                  <span className="font-mono text-sm font-semibold">{sci(t.value)}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-black/40">=</span>
              <div className="rounded-lg bg-accent px-3 py-1.5 text-white">
                <span className="block text-[11px] opacity-80">Cumplen la política</span>
                <span className="font-mono text-sm font-semibold">{sci(result.total)}</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-black/50">Pasa el cursor sobre un valor para ver el número completo.</p>
        </div>
      )}
      {config.requireDigit && config.endsWithDigit && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          💡 Como la contraseña <strong>termina en número</strong>, ya tiene al menos uno: por eso "sin números" vale 0.
        </p>
      )}
    </div>
  )
}
