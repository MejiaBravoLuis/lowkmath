import { alphabetSize, compute } from '../engine/count.ts'
import { explain } from '../engine/explain.ts'
import { fmt } from '../engine/format.ts'
import { lengthTable, policyTable, scenarioTable } from '../engine/presets.ts'
import type { Config } from '../engine/types.ts'

const formulaOf = (c: Config) => explain(c, compute(c)).substitution[0].replace(/^N = /, '')

/** Partes 12, 14 y 15 del proyecto como boletos, tarjetas de longitud y burbujas proporcionales. */
export default function Catalog({ onPick }: { onPick: (c: Config) => void }) {
  const base = compute(scenarioTable[0].config).total
  const lens = lengthTable.map((r) => ({ r, total: compute(r.config).total }))
  const maxLen = lens[lens.length - 1].total

  return (
    <div className="space-y-12">
      <div>
        <h3 className="font-display text-lg font-semibold">Parte 12 · Comparación de políticas</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Toca un boleto para cargarlo en la bóveda.</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policyTable.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onPick(r.config)}
                className="ticket group w-full px-5 py-4 text-left shadow-[0_4px_0_var(--color-steel-deep)] transition duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg]"
                style={{ transform: undefined }}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold">{r.label}</span>
                    <span className="block text-xs text-ink-soft">{r.restrictions} · {r.config.repetition ? 'con' : 'sin'} repetición</span>
                  </span>
                  <span className="rounded-lg bg-ink px-2 py-1 font-mono text-[11px] font-bold text-white">{alphabetSize(r.config)}×{r.config.length}</span>
                </span>
                <span className="my-2.5 block border-t-2 border-dashed border-steel" />
                <span className="block overflow-x-auto font-mono text-xs text-lower">{formulaOf(r.config)}</span>
                <span className="mt-1 block break-all font-mono text-base font-bold tabular-nums">{fmt(compute(r.config).total)}</span>
                <span className="sr-only">Boleto {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold">Parte 14 · Cada casilla extra multiplica por 68</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Los cuadritos son las casillas; mira cuánto crece el total.</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lens.map(({ r, total }, idx) => (
            <li key={r.id}>
              <button type="button" onClick={() => onPick(r.config)} className="w-full rounded-3xl bg-paper p-4 text-left shadow-[0_4px_0_var(--color-steel-deep)] transition duration-300 hover:-translate-y-1.5">
                <span className="flex flex-wrap gap-1" aria-hidden="true">
                  {Array.from({ length: r.config.length }, (_, i) => (
                    <span key={i} data-kind={['lower', 'upper', 'digit', 'symbol'][(i + idx) % 4]} className="size-4 rounded bg-[var(--k)]" />
                  ))}
                </span>
                <span className="mt-3 block text-sm font-bold">{r.config.length} caracteres</span>
                <span className="block font-mono text-xs text-lower">{formulaOf(r.config)}</span>
                <span className="mt-1 block break-all font-mono text-sm font-bold tabular-nums">{fmt(total)}</span>
                <span className="mt-1 block text-[11px] text-ink-soft">
                  {total === maxLen ? 'La más fuerte' : `${(Number(maxLen / total) || 1).toLocaleString('en-US')}× menos que 12`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold">Parte 15 · Qué tanto recorta cada restricción</h3>
        <p className="mb-4 mt-1 text-sm text-ink-soft">El tamaño de cada burbuja es el porcentaje que queda respecto al escenario A.</p>
        <ul className="flex flex-wrap items-end justify-center gap-5 sm:gap-8">
          {scenarioTable.map((r, i) => {
            const total = compute(r.config).total
            const pct = Number((total * 10000n) / base) / 100
            const d = Math.max(76, Math.sqrt(pct / 100) * 190)
            return (
              <li key={r.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onPick(r.config)}
                  data-kind={['lower', 'upper', 'digit', 'symbol', 'upper'][i]}
                  style={{ width: d, height: d }}
                  className="bubble flex flex-col items-center justify-center rounded-full bg-[var(--k)] text-white shadow-[0_6px_0_var(--k-deep)] transition duration-300 hover:-translate-y-2 hover:scale-105"
                  aria-label={`Escenario ${r.label}: ${r.note}. ${pct.toFixed(1)}% de A`}
                >
                  <span className={`font-display text-2xl font-bold ${i === 2 ? 'text-ink' : ''}`}>{r.label}</span>
                  <span className={`font-mono text-xs font-bold ${i === 2 ? 'text-ink' : ''}`}>{pct.toFixed(1)}%</span>
                </button>
                <span className="mt-3 max-w-36 text-center text-xs text-ink-soft">{r.note}</span>
                <span className="mt-0.5 font-mono text-[11px] text-lower">{formulaOf(r.config)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
