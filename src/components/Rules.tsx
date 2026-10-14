import type { Config } from '../engine/types.ts'

type Rule = { key: keyof Config; kind: 'lower' | 'upper' | 'digit' | 'symbol'; title: string; desc: string; example: string; formula: string }

const MUST: Rule[] = [
  { key: 'requireUpper', kind: 'upper', title: 'Al menos una mayúscula', desc: 'En cualquier lugar.', example: 'hOla', formula: 'N = nᵏ − (n − u)ᵏ' },
  { key: 'requireLower', kind: 'lower', title: 'Al menos una minúscula', desc: 'En cualquier lugar.', example: 'HOLa', formula: 'N = nᵏ − (n − l)ᵏ' },
  { key: 'requireDigit', kind: 'digit', title: 'Al menos un número', desc: 'En cualquier lugar.', example: 'ho1a', formula: 'N = nᵏ − (n − d)ᵏ' },
  { key: 'requireSymbol', kind: 'symbol', title: 'Al menos un símbolo', desc: 'En cualquier lugar.', example: 'ho!a', formula: 'N = nᵏ − (n − s)ᵏ' },
]
const POS: Rule[] = [
  { key: 'endsWithDigit', kind: 'digit', title: 'Termina en número', desc: 'La última casilla solo acepta números.', example: 'hola7', formula: 'N = nᵏ⁻¹ · d' },
  { key: 'noStartSymbol', kind: 'symbol', title: 'No empieza con símbolo', desc: 'La primera casilla no acepta símbolos.', example: '!hola ✗', formula: 'N = (n − s) · nᵏ⁻¹' },
]

function Stamp({ r, on, toggle }: { r: Rule; on: boolean; toggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} data-kind={r.kind} onClick={toggle} className={`stamp ${on ? 'is-on' : ''}`}>
      <span className="stamp-mark" aria-hidden="true">{on ? '✓' : ''}</span>
      <span className="block pr-10 text-sm font-bold">{r.title}</span>
      <span className="block text-xs text-ink-soft">{r.desc}</span>
      <span className="mt-1.5 flex items-center gap-2">
        <span className="rounded-md bg-white/70 px-1.5 py-0.5 font-mono text-xs">{r.example}</span>
        <span className={`font-mono text-[11px] ${on ? 'font-bold text-[var(--k-deep)]' : 'text-ink-soft'}`}>{r.formula}</span>
      </span>
    </button>
  )
}

export default function Rules({ config, onChange }: { config: Config; onChange: (c: Config) => void }) {
  const t = (k: keyof Config) => onChange({ ...config, [k]: !config[k] })
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold">La contraseña debe contener…</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MUST.map((r) => <Stamp key={r.key} r={r} on={Boolean(config[r.key])} toggle={() => t(r.key)} />)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Restricciones de posición</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {POS.map((r) => <Stamp key={r.key} r={r} on={Boolean(config[r.key])} toggle={() => t(r.key)} />)}
        </div>
      </div>
    </div>
  )
}

const OPTS = [
  { v: true, t: 'Se puede repetir', ex: 'aa7a ✓', f: 'N = nᵏ', hint: 'Cada casilla ve todos los caracteres otra vez.' },
  { v: false, t: 'Todos distintos', ex: 'a7bc ✓   aa7a ✗', f: 'P(n, k) = n! / (n − k)!', hint: 'Cada carácter usado deja una opción menos.' },
]

export function Bag({ config, onChange }: { config: Config; onChange: (c: Config) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="¿Se puede repetir un carácter?">
      {OPTS.map((o) => {
        const on = config.repetition === o.v
        return (
          <button
            key={String(o.v)} type="button" role="radio" aria-checked={on}
            onClick={() => onChange({ ...config, repetition: o.v })}
            className={`group relative overflow-hidden rounded-3xl p-4 text-left transition duration-300 ${on ? 'bg-ink text-white -translate-y-1 shadow-[0_8px_0_#000a]' : 'bg-paper shadow-[0_4px_0_var(--color-steel-deep)] hover:-translate-y-0.5'}`}
          >
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {(o.v ? ['a', 'a', '7', 'a'] : ['a', '7', 'b', 'c']).map((c, i) => (
                <span key={i} className={`flex size-8 items-center justify-center rounded-lg font-mono text-sm font-bold transition-transform duration-300 ${on ? 'bg-white/15' : 'bg-steel'} ${o.v && on && i === 1 ? 'rotate-[-8deg]' : ''}`}>{c}</span>
              ))}
            </span>
            <span className="mt-2 block text-sm font-bold">{o.t}</span>
            <span className={`block text-xs ${on ? 'text-white/70' : 'text-ink-soft'}`}>{o.hint}</span>
            <span className={`mt-1.5 block font-mono text-xs font-semibold ${on ? 'text-digit' : 'text-ink-soft'}`}>{o.f}</span>
          </button>
        )
      })}
    </div>
  )
}
