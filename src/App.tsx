import { useMemo, useState } from 'react'
import FormulaSheet from './components/FormulaSheet.tsx'
import ConfigForm from './components/ConfigForm.tsx'
import ReferenceTables from './components/ReferenceTables.tsx'
import ResultPanel from './components/ResultPanel.tsx'
import BlurText from './components/reactbits/BlurText.tsx'
import ShinyText from './components/reactbits/ShinyText.tsx'
import { compute } from './engine/count.ts'
import { defaultConfig, presets } from './engine/presets.ts'
import type { Config } from './engine/types.ts'

const same = (a: Config, b: Config) => JSON.stringify(a) === JSON.stringify(b)

const HOW = [
  { n: '1', t: 'Elige los caracteres', d: 'Cuántas minúsculas, mayúsculas, números y símbolos se pueden usar.' },
  { n: '2', t: 'Define casillas y reglas', d: 'Longitud, si se puede repetir y qué condiciones debe cumplir.' },
  { n: '3', t: 'Lee la respuesta', d: 'Ves el total y el procedimiento paso a paso, listo para tu informe.' },
]

export default function App() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const result = useMemo(() => compute(config), [config])

  const pick = (c: Config) => {
    setConfig(c)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <ShinyText
          text="Matemática Discreta · Proyecto final"
          color="#0f766e"
          shineColor="#5eead4"
          speed={3}
          className="text-xs font-semibold uppercase tracking-widest"
        />
        <div role="heading" aria-level={1} className="mt-2">
          <BlurText
            text="¿Cuántas contraseñas distintas existen?"
            delay={90}
            animateBy="words"
            className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl"
          />
        </div>
        <p className="mt-3 max-w-2xl text-base text-black/70">
          Contar contraseñas es <strong>multiplicar las opciones de cada casilla</strong>. Por ejemplo, 3 casillas
          con 10 dígitos posibles dan 10 × 10 × 10 = 1,000 contraseñas. Esta calculadora hace lo mismo con
          cualquier política y te explica cada paso.
        </p>

        <p className="mt-3 text-sm">
          <a href="#formulario" className="font-semibold text-accent underline underline-offset-4">Ver el formulario completo ↓</a>
        </p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {HOW.map((h) => (
            <li key={h.n} className="flex gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {h.n}
              </span>
              <span>
                <span className="block text-sm font-bold">{h.t}</span>
                <span className="block text-xs text-black/60">{h.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </header>

      <section aria-label="Ejemplos del proyecto" className="mb-6">
        <h2 className="mb-2 text-sm font-bold">Empieza con un ejemplo del proyecto</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = same(p.config, config)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setConfig(p.config)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-black/15 bg-white hover:border-accent hover:text-accent'
                }`}
              >
                <span className={`mr-1.5 font-bold ${active ? 'text-white/80' : 'text-accent'}`}>
                  {p.group.replace('Parte ', 'P')}
                </span>
                {p.title}
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        <ConfigForm config={config} onChange={setConfig} />
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          <ResultPanel config={config} result={result} />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-3 text-xl font-bold">Tablas comparativas del proyecto</h2>
        <ReferenceTables onPick={pick} />
      </section>

      <section className="mt-12" id="formulario">
        <h2 className="mb-1 text-xl font-bold">Formulario</h2>
        <p className="mb-3 text-sm text-black/60">Todas las fórmulas que se usan, cuándo aplicarlas y un ejemplo.</p>
        <FormulaSheet />
      </section>

      <footer className="mt-10 border-t border-black/10 pt-4 text-xs text-black/50">
        Los cálculos usan enteros de precisión arbitraria (BigInt) y corren en tu navegador; no hay servidor.
        Componentes animados de <a className="underline" href="https://reactbits.dev" target="_blank" rel="noreferrer">React Bits</a>.
      </footer>
    </div>
  )
}
