import { plainStory, termLabel } from '../engine/explain.ts'
import { fmt, sci } from '../engine/format.ts'
import type { Config, CountResult } from '../engine/types.ts'

/** El candado explica en lenguaje simple y la ecuación "total − los que no cumplen" aparece como fichas. */
export default function Story({ config, result }: { config: Config; result: CountResult }) {
  const lines = plainStory(config, result)
  const multi = result.terms.length > 1

  return (
    <div className="space-y-5">
      <ol className="space-y-2.5">
        {lines.map((l, i) => (
          <li key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
            <span className={`max-w-[92%] rounded-3xl px-4 py-2.5 text-sm leading-snug shadow-[0_3px_0_var(--color-steel-deep)] ${i % 2 ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-paper'}`}>
              {l}
            </span>
          </li>
        ))}
      </ol>

      {multi && (
        <div>
          <p className="mb-2 text-sm font-semibold">En números</p>
          <div className="flex flex-wrap items-center gap-2.5">
            {result.terms.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {i > 0 && (
                  <span className={`flex size-8 items-center justify-center rounded-full text-lg font-black text-white ${t.sign === 1 ? 'bg-symbol' : 'bg-upper'}`}>
                    {t.sign === 1 ? '+' : '−'}
                  </span>
                )}
                <div title={fmt(t.value)} className="rounded-2xl bg-paper px-3.5 py-2 shadow-[0_3px_0_var(--color-steel-deep)] transition hover:-translate-y-1 hover:rotate-[-1.5deg]">
                  <span className="block text-[11px] text-ink-soft">{termLabel(t, result.required)}</span>
                  <span className="font-mono text-sm font-bold">{sci(t.value)}</span>
                </div>
              </div>
            ))}
            <span className="flex size-8 items-center justify-center rounded-full bg-ink text-lg font-black text-white">=</span>
            <div className="rounded-2xl bg-ink px-3.5 py-2 text-white shadow-[0_3px_0_#000a]">
              <span className="block text-[11px] text-white/70">Cumplen la política</span>
              <span className="font-mono text-sm font-bold">{sci(result.total)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-soft">Pasa el cursor sobre una ficha para ver el número completo.</p>
        </div>
      )}

      {config.requireDigit && config.endsWithDigit && (
        <p className="rounded-2xl bg-digit-soft px-4 py-2.5 text-sm">
          💡 Como la contraseña <strong>termina en número</strong>, ya tiene al menos uno: por eso “sin números” vale 0.
        </p>
      )}
    </div>
  )
}
