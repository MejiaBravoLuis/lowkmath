import type { Config } from '../engine/types.ts'

interface Props {
  config: Config
  onChange: (c: Config) => void
}

function NumberField({ label, value, max, onChange }: {
  label: string; value: number; max: number; onChange: (n: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/60">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          onChange(Number.isNaN(n) ? 0 : Math.min(max, Math.max(0, n)))
        }}
        className="w-full rounded-md border border-black/15 bg-white px-3 py-2 font-mono text-sm tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      />
    </label>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-black/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-accent"
      />
      {label}
    </label>
  )
}

export default function ConfigForm({ config, onChange }: Props) {
  const set = <K extends keyof Config>(k: K, v: Config[K]) => onChange({ ...config, [k]: v })

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold">Longitud y caracteres disponibles</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberField label="Longitud" value={config.length} max={64} onChange={(n) => set('length', Math.max(1, n))} />
          <NumberField label="Minúsculas" value={config.lower} max={999} onChange={(n) => set('lower', n)} />
          <NumberField label="Mayúsculas" value={config.upper} max={999} onChange={(n) => set('upper', n)} />
          <NumberField label="Números" value={config.digits} max={999} onChange={(n) => set('digits', n)} />
          <NumberField label="Símbolos" value={config.symbols} max={999} onChange={(n) => set('symbols', n)} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Repetición</h3>
        <div className="inline-flex rounded-md border border-black/15 bg-white p-0.5 text-sm">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => set('repetition', v)}
              className={`rounded px-3 py-1.5 transition-colors ${
                config.repetition === v ? 'bg-accent text-white' : 'text-black/70 hover:bg-black/5'
              }`}
            >
              {v ? 'Con repetición' : 'Sin repetición'}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold">Restricciones de contenido</h3>
        <div className="grid sm:grid-cols-2">
          <Check label="Al menos una minúscula" checked={config.requireLower} onChange={(b) => set('requireLower', b)} />
          <Check label="Al menos una mayúscula" checked={config.requireUpper} onChange={(b) => set('requireUpper', b)} />
          <Check label="Al menos un número" checked={config.requireDigit} onChange={(b) => set('requireDigit', b)} />
          <Check label="Al menos un símbolo" checked={config.requireSymbol} onChange={(b) => set('requireSymbol', b)} />
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold">Restricciones de posición</h3>
        <div className="grid sm:grid-cols-2">
          <Check label="Termina en número" checked={config.endsWithDigit} onChange={(b) => set('endsWithDigit', b)} />
          <Check label="No comienza con símbolo" checked={config.noStartSymbol} onChange={(b) => set('noStartSymbol', b)} />
        </div>
      </section>
    </div>
  )
}
