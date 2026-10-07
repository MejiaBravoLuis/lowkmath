import { useMemo, useState } from 'react'
import ConfigForm from './components/ConfigForm.tsx'
import ReferenceTables from './components/ReferenceTables.tsx'
import ResultPanel from './components/ResultPanel.tsx'
import { compute } from './engine/count.ts'
import { defaultConfig, presets } from './engine/presets.ts'
import type { Config } from './engine/types.ts'

const groups = Array.from(new Set(presets.map((p) => p.group)))

export default function App() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const result = useMemo(() => compute(config), [config])

  const scrollTop = (c: Config) => {
    setConfig(c)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Matemática Discreta · Proyecto final</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Calculadora de contraseñas</h1>
        <p className="mt-2 max-w-2xl text-black/70">
          Cuenta cuántas contraseñas cumplen una política usando regla del producto, permutaciones,
          complemento e inclusión–exclusión, y muestra el procedimiento completo.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <label className="mb-5 block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-black/60">
                Cargar un escenario del proyecto
              </span>
              <select
                value=""
                onChange={(e) => {
                  const p = presets.find((x) => x.id === e.target.value)
                  if (p) setConfig(p.config)
                }}
                className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              >
                <option value="">Elegir…</option>
                {groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {presets.filter((p) => p.group === g).map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <ConfigForm config={config} onChange={setConfig} />
          </div>
        </div>

        <ResultPanel config={config} result={result} />
      </div>

      <div className="mt-10">
        <ReferenceTables onPick={scrollTop} />
      </div>

      <footer className="mt-10 border-t border-black/10 pt-4 text-xs text-black/50">
        Los cálculos usan enteros de precisión arbitraria (BigInt) y se ejecutan en tu navegador; no hay servidor.
      </footer>
    </div>
  )
}
