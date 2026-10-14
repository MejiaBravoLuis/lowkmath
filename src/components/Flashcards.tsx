import { useState } from 'react'
import { FORMULAS } from '../engine/formulas.ts'

/** El formulario como tarjetas que se voltean: al frente la fórmula; atrás cuándo usarla y un ejemplo. */
export default function Flashcards() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const tones = ['bg-lower-soft', 'bg-upper-soft', 'bg-digit-soft', 'bg-symbol-soft']

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FORMULAS.map((f, i) => {
        const on = Boolean(flipped[f.id])
        return (
          <li key={f.id}>
            <button
              type="button" aria-pressed={on} onClick={() => setFlipped((s) => ({ ...s, [f.id]: !s[f.id] }))}
              className={`flip block h-56 w-full text-left ${on ? 'is-flipped' : ''}`}
              aria-label={`${f.name}. Tocar para voltear`}
            >
              <span className="flip-inner block size-full">
                <span className={`flip-face ${tones[i % 4]} flex flex-col p-5 shadow-[0_5px_0_var(--color-steel-deep)]`}>
                  <span className="text-sm font-bold">{f.name}</span>
                  <span className="my-auto block overflow-x-auto py-2 font-mono text-[15px] font-bold leading-snug">{f.general}</span>
                  <span className="text-xs text-ink/60">Toca para ver cuándo se usa ↻</span>
                </span>
                <span className="flip-face flip-back flex flex-col bg-ink p-5 text-white shadow-[0_5px_0_#000a]">
                  <span className="text-xs leading-relaxed text-white/85">{f.when}</span>
                  <span className="mt-auto block overflow-x-auto rounded-xl bg-white/10 px-3 py-2 font-mono text-xs">Ej.: {f.example}</span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
