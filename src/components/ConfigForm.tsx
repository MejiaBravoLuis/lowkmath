import { classSizes } from '../engine/count.ts'
import { alphabetLine } from '../engine/formulas.ts'
import type { CharClass, Config } from '../engine/types.ts'
import { CLASS_META } from '../ui.ts'
import Panel from './Panel.tsx'

interface Props {
  config: Config
  onChange: (c: Config) => void
}

const CLASSES: CharClass[] = ['lower', 'upper', 'digit', 'symbol']

function Stepper({ value, min, max, onChange, label }: {
  value: number; min: number; max: number; onChange: (n: number) => void; label: string
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const btn =
    'flex size-9 items-center justify-center rounded-lg border border-black/15 bg-white text-lg leading-none transition hover:bg-black/5 active:scale-95 disabled:opacity-30'
  return (
    <div className="inline-flex items-center gap-1.5" role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={`Menos ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          onChange(Number.isNaN(n) ? min : clamp(n))
        }}
        className="h-9 w-16 rounded-lg border border-black/15 bg-white text-center font-mono text-base font-semibold tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={btn} aria-label={`Más ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        +
      </button>
    </div>
  )
}

function FormulaLine({ label, children, active = true }: { label: string; children: string; active?: boolean }) {
  return (
    <p
      className={`mt-3 flex flex-wrap items-baseline gap-x-2 rounded-lg px-3 py-2 font-mono text-[13px] ${
        active ? 'bg-accent/8 text-accent' : 'bg-black/4 text-black/50'
      }`}
    >
      <span className="font-sans text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
      <span>{children}</span>
    </p>
  )
}

function RuleToggle({ title, desc, example, formula, checked, onChange }: {
  title: string; desc: string; example: string; formula: string; checked: boolean; onChange: (b: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        checked ? 'border-accent bg-accent/5' : 'border-black/10 bg-white hover:border-black/25'
      }`}
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-black/20'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-black/60">{desc}</span>
        <span className={`mt-1 block font-mono text-[11px] ${checked ? 'text-accent' : 'text-black/40'}`}>{formula}</span>
      </span>
      <span className="hidden shrink-0 rounded-md bg-black/5 px-2 py-1 font-mono text-xs text-black/60 sm:block">{example}</span>
    </button>
  )
}

export default function ConfigForm({ config, onChange }: Props) {
  const set = <K extends keyof Config>(k: K, v: Config[K]) => onChange({ ...config, [k]: v })
  const sizes = classSizes(config)

  return (
    <div className="space-y-5">
      <Panel step={1} title="¿Qué caracteres se pueden usar?" hint="Indica cuántos hay de cada tipo.">
        <div className="grid gap-3 sm:grid-cols-2">
          {CLASSES.map((k) => {
            const m = CLASS_META[k]
            return (
              <div key={k} className={`rounded-xl border p-3 ${m.card}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-2 text-sm font-semibold ${m.text}`}>
                    <span className={`size-2.5 rounded-full ${m.dot}`} />
                    {m.label}
                  </span>
                  <span className="font-mono text-xs text-black/50">{m.sample}</span>
                </div>
                <Stepper
                  label={m.label.toLowerCase()}
                  value={sizes[k]}
                  min={0}
                  max={999}
                  onChange={(n) => set(m.field, n as never)}
                />
              </div>
            )
          })}
        </div>
        <FormulaLine label="Fórmula">{alphabetLine(config)}</FormulaLine>
        <p className="mt-1.5 text-xs text-black/55">
          n = total de caracteres; l, u, d, s = minúsculas, mayúsculas, números y símbolos.
        </p>
      </Panel>

      <Panel step={2} title="¿Cuántos caracteres tiene la contraseña?" hint="Cada carácter es una casilla.">
        <div className="flex flex-wrap items-center gap-4">
          <Stepper label="casillas" value={config.length} min={1} max={64} onChange={(n) => set('length', n)} />
          <input
            type="range"
            min={1}
            max={24}
            value={Math.min(config.length, 24)}
            onChange={(e) => set('length', parseInt(e.target.value, 10))}
            aria-label="Longitud de la contraseña"
            className="h-2 min-w-32 flex-1 cursor-pointer accent-accent"
          />
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold">¿Se puede repetir un carácter?</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { v: true, t: 'Sí, se puede repetir', ex: 'aa7a ✓', f: 'N = nᵏ' },
            { v: false, t: 'No, todos distintos', ex: 'a7bc ✓   aa7a ✗', f: 'P(n, k) = n! / (n − k)!' },
          ].map((o) => (
            <button
              key={String(o.v)}
              type="button"
              onClick={() => set('repetition', o.v)}
              aria-pressed={config.repetition === o.v}
              className={`rounded-xl border p-3 text-left transition ${
                config.repetition === o.v ? 'border-accent bg-accent/5 ring-2 ring-accent/20' : 'border-black/10 bg-white hover:border-black/25'
              }`}
            >
              <span className="block text-sm font-semibold">{o.t}</span>
              <span className="mt-1 block font-mono text-xs text-black/55">{o.ex}</span>
              <span className={`mt-1.5 block font-mono text-xs font-semibold ${config.repetition === o.v ? 'text-accent' : 'text-black/40'}`}>{o.f}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel step={3} title="¿Hay reglas extra?" hint="Actívalas para ver cómo reducen el número de contraseñas. Debajo de cada regla está su fórmula (k = casillas).">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">Debe contener</h3>
        <div className="space-y-2">
          <RuleToggle title="Al menos una mayúscula" desc="Aparece una letra mayúscula en cualquier lugar." example="hOla" formula="N = nᵏ − (n − u)ᵏ" checked={config.requireUpper} onChange={(b) => set('requireUpper', b)} />
          <RuleToggle title="Al menos una minúscula" desc="Aparece una letra minúscula en cualquier lugar." example="HOLa" formula="N = nᵏ − (n − l)ᵏ" checked={config.requireLower} onChange={(b) => set('requireLower', b)} />
          <RuleToggle title="Al menos un número" desc="Aparece un dígito en cualquier lugar." example="ho1a" formula="N = nᵏ − (n − d)ᵏ" checked={config.requireDigit} onChange={(b) => set('requireDigit', b)} />
          <RuleToggle title="Al menos un símbolo" desc="Aparece un símbolo en cualquier lugar." example="ho!a" formula="N = nᵏ − (n − s)ᵏ" checked={config.requireSymbol} onChange={(b) => set('requireSymbol', b)} />
        </div>
        <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-black/50">Posición</h3>
        <div className="space-y-2">
          <RuleToggle title="Termina en número" desc="La última casilla solo acepta números." example="hola7" formula="N = nᵏ⁻¹ · d" checked={config.endsWithDigit} onChange={(b) => set('endsWithDigit', b)} />
          <RuleToggle title="No empieza con símbolo" desc="La primera casilla no acepta símbolos." example="!hola ✗" formula="N = (n − s) · nᵏ⁻¹" checked={config.noStartSymbol} onChange={(b) => set('noStartSymbol', b)} />
        </div>
      </Panel>
    </div>
  )
}
