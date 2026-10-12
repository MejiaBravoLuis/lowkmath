import { appliedFormulas } from '../engine/formulas.ts'
import type { Config, CountResult } from '../engine/types.ts'

/** Las fórmulas que se usan en esta política: primero la general y luego con los números sustituidos. */
export default function AppliedFormulas({ config, result }: { config: Config; result: CountResult }) {
  const items = appliedFormulas(config, result)

  return (
    <section aria-label="Fórmulas usadas">
      <h3 className="mb-2 text-sm font-bold">Fórmulas que se usan aquí</h3>
      <ul className="space-y-2">
        {items.map((f) => (
          <li key={f.title} className="rounded-xl border border-black/10 bg-white p-3">
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="mt-1.5 overflow-x-auto rounded-lg bg-black/4 px-3 py-1.5 font-mono text-[13px]">{f.general}</p>
            <p className="mt-1 overflow-x-auto rounded-lg bg-accent/8 px-3 py-1.5 font-mono text-[13px] text-accent">{f.substituted}</p>
            <p className="mt-1.5 text-xs text-black/55">{f.why}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
