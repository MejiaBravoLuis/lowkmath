import { useState } from 'react'
import { classSizes } from '../engine/count.ts'
import { alphabetLine } from '../engine/formulas.ts'
import { BASE } from '../engine/sample.ts'
import type { CharClass, Config } from '../engine/types.ts'
import { CLASS_META } from '../ui.ts'
import ClickSpark from './reactbits/ClickSpark.tsx'

const KINDS: CharClass[] = ['lower', 'upper', 'digit', 'symbol']

/** Bandeja de teclas: tocar una tecla activa todas las anteriores; la cantidad de teclas encendidas es el tamaño del conjunto. */
export default function Tray({ config, onChange }: { config: Config; onChange: (c: Config) => void }) {
  const sizes = classSizes(config)
  const [hover, setHover] = useState<{ kind: CharClass; i: number } | null>(null)
  const set = (k: CharClass, n: number) => onChange({ ...config, [CLASS_META[k].field]: Math.max(0, Math.min(999, n)) })

  return (
    <ClickSpark sparkColor="#15163a" sparkCount={6} sparkRadius={16} duration={380}>
      <div className="space-y-3">
        {KINDS.map((k) => {
          const base = BASE[k]
          const n = sizes[k]
          const extra = Math.max(0, n - base.length)
          return (
            <div key={k} data-kind={k} className="rounded-2xl bg-paper/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-baseline gap-2">
                <p className="text-sm font-bold text-[var(--k-deep)]">{CLASS_META[k].label}</p>
                <p className="font-mono text-xs text-ink-soft">{n} {n === 1 ? 'tecla' : 'teclas'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="key !size-8 !rounded-full" aria-label={`Menos ${CLASS_META[k].plural}`} disabled={n <= 0} onClick={() => set(k, n - 1)}>−</button>
                <button type="button" className="key !size-8 !rounded-full" aria-label={`Más ${CLASS_META[k].plural}`} onClick={() => set(k, n + 1)}>+</button>
              </div>
              </div>
              <div className="flex min-w-0 flex-wrap gap-1.5" onPointerLeave={() => setHover(null)}>
                {[...base].map((ch, i) => {
                  const on = i < n
                  const preview = !on && hover?.kind === k && i <= hover.i
                  return (
                      <button key={ch}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${CLASS_META[k].label}: usar ${i + 1}`}
                        style={{ ['--i' as string]: i }}
                        className={`key ${on ? 'is-on' : ''} ${preview ? 'is-preview' : ''} ${k === 'digit' ? 'is-digit-ink' : ''}`}
                        onPointerEnter={() => setHover({ kind: k, i })}
                        onFocus={() => setHover({ kind: k, i })}
                        onBlur={() => setHover(null)}
                        onClick={() => set(k, n === i + 1 ? i : i + 1)}
                      >
                        {ch}
                      </button>
                  )
                })}
                {extra > 0 && (
                  <span className="key is-on cursor-default !w-auto px-2.5" title="Caracteres extra más allá de los del teclado">+{extra}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 rounded-2xl bg-ink px-4 py-2.5 font-mono text-[13px] text-white/90">
        <span className="mr-2 font-sans text-xs font-semibold text-white/60">Fórmula</span>
        {alphabetLine(config)}
      </p>
      <p className="mt-1.5 text-xs text-ink-soft">n = total de caracteres; l, u, d, s = minúsculas, mayúsculas, números y símbolos.</p>
    </ClickSpark>
  )
}
