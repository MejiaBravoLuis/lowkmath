import { appliedFormulas } from '../engine/formulas.ts'
import type { Config, CountResult } from '../engine/types.ts'

/** Cada fórmula usada es un boleto: arriba la general, abajo la misma con tus números. */
export default function AppliedFormulas({ config, result }: { config: Config; result: CountResult }) {
  const items = appliedFormulas(config, result)
  return (
    <section aria-label="Fórmulas usadas">
      <h3 className="mb-2 text-sm font-semibold">Fórmulas que se usan aquí</h3>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((f) => (
          <li key={f.title} className="ticket px-5 py-3.5 shadow-[0_4px_0_var(--color-steel-deep)]">
            <p className="text-sm font-bold">{f.title}</p>
            <p className="mt-1.5 overflow-x-auto font-mono text-[13px] text-ink-soft">{f.general}</p>
            <p className="my-2 border-t-2 border-dashed border-steel" />
            <p className="overflow-x-auto font-mono text-[13px] font-semibold text-lower">{f.substituted}</p>
            <p className="mt-1.5 text-xs text-ink-soft">{f.why}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
