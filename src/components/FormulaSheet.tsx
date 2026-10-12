import { fmt } from '../engine/format.ts'
import { FORMULAS, setAnalysis } from '../engine/formulas.ts'

/** Formulario completo + análisis de la Parte 13 (teoría de conjuntos) con valores reales. */
export default function FormulaSheet() {
  const sets = setAnalysis()

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORMULAS.map((f) => (
          <article key={f.id} className="flex flex-col rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">{f.name}</h3>
            <p className="mt-2 overflow-x-auto rounded-lg bg-accent/8 px-3 py-2 font-mono text-[13px] text-accent">{f.general}</p>
            <p className="mt-2 flex-1 text-xs text-black/65">{f.when}</p>
            <p className="mt-2 overflow-x-auto font-mono text-xs text-black/50">Ej.: {f.example}</p>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <h3 className="border-b border-black/10 px-4 py-3 text-sm font-bold">
          Parte 13 · Teoría de conjuntos (política completa, 10 caracteres, con repetición)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-black/3 text-left text-xs font-semibold uppercase tracking-wide text-black/55">
                <th className="px-3 py-2">Conjunto</th>
                <th className="px-3 py-2">Qué representa</th>
                <th className="px-3 py-2">Fórmula</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((r) => (
                <tr key={r.symbol} className="border-t border-black/5 align-top">
                  <td className="px-3 py-2 font-mono text-sm font-bold text-accent">{r.symbol}</td>
                  <td className="px-3 py-2 text-sm">{r.meaning}</td>
                  <td className="px-3 py-2 font-mono text-xs text-black/70">{r.formula}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm tabular-nums">{fmt(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-black/10 px-4 py-3 text-xs text-black/55">
          Interpretación: N ∩ M es lo que cumple ambas reglas a la vez; N ∪ M, lo que cumple al menos una; y N − M, lo que
          cumple N pero no M.
        </p>
      </section>
    </div>
  )
}
