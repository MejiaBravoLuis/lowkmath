import { useCallback, useMemo, useState, type ReactNode } from 'react'
import Catalog from './components/Catalog.tsx'
import AppliedFormulas from './components/AppliedFormulas.tsx'
import Flashcards from './components/Flashcards.tsx'
import FormalProcedure from './components/FormalProcedure.tsx'
import Rules, { Bag } from './components/Rules.tsx'
import Story from './components/Story.tsx'
import Tray from './components/Tray.tsx'
import Vault from './components/Vault.tsx'
import Venn from './components/Venn.tsx'
import ClickSpark from './components/reactbits/ClickSpark.tsx'
import DecryptedText from './components/reactbits/DecryptedText.tsx'
import { compute } from './engine/count.ts'
import { defaultConfig, presets } from './engine/presets.ts'
import { samplePassword } from './engine/sample.ts'
import type { Config } from './engine/types.ts'

const same = (a: Config, b: Config) => JSON.stringify(a) === JSON.stringify(b)

function Section({ id, title, lead, children }: { id?: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-20 scroll-mt-6">
      <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
      {lead && <p className="mt-2 max-w-2xl text-ink-soft">{lead}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Step({ n, title, hint, children }: { n: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-5 shadow-[0_5px_0_var(--color-steel)] backdrop-blur sm:p-6">
      <header className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white">{n}</span>
        <div>
          <h2 className="font-display text-base font-semibold leading-tight sm:text-lg">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

export default function App() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [spin, setSpin] = useState(0)
  const result = useMemo(() => compute(config), [config])
  // Solo decoración: una contraseña de ejemplo que cumple la política. No interviene en ningún conteo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sample = useMemo(() => samplePassword(config), [config, spin])

  const onSpin = useCallback(() => setSpin((s) => s + 1), [])
  const pick = (c: Config) => {
    setConfig(c)
    document.getElementById('boveda')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ClickSpark sparkColor="#15163a" sparkCount={8} sparkRadius={22} duration={450}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <header>
          <p className="font-display text-xs font-medium text-ink-soft">Matemática Discreta · Proyecto final · SecureTech Solutions</p>
          <h1 className="mt-3 max-w-4xl font-display text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <DecryptedText
              text="¿Cuántas contraseñas distintas existen?"
              speed={38}
              maxIterations={14}
              sequential
              revealDirection="start"
              animateOn="view"
              characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&"
            />
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">
            Contar contraseñas es <strong className="text-ink">multiplicar las opciones de cada casilla</strong>. Tres casillas con
            10 dígitos posibles dan 10 × 10 × 10 = 1,000. Gira las ruedas de la bóveda, cambia las reglas y mira cómo se mueve el número.
          </p>

          <div className="mt-8" role="group" aria-label="Ejemplos del proyecto">
            <p className="mb-3 text-sm font-semibold">Cuelga una llave del llavero para cargar un ejemplo del proyecto</p>
            <div className="-mx-4 flex gap-x-3 gap-y-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>button]:shrink-0">
              {presets.map((p) => {
                const active = same(p.config, config)
                return (
                  <button key={p.id} type="button" aria-pressed={active} onClick={() => setConfig(p.config)} className={`keytag ${active ? 'is-on' : ''}`}>
                    <span className={`font-mono text-[11px] ${active ? 'text-digit' : 'text-lower'}`}>{p.group.replace('Parte ', 'P')}</span>
                    {p.title}
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        <main className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
          <div id="boveda" className="scroll-mt-4 lg:sticky lg:top-4 lg:order-2">
            <Vault config={config} result={result} sample={sample} spin={spin} onSpin={onSpin} onLength={(n) => setConfig((c) => ({ ...c, length: n }))} />
          </div>
          <div className="space-y-6 lg:order-1">
            <Step n={1} title="Arma el teclado" hint="Toca una tecla: se encienden todas hasta esa. Cada tecla encendida es un carácter disponible.">
              <Tray config={config} onChange={setConfig} />
            </Step>
            <Step n={2} title="¿Se puede repetir un carácter?" hint="Cambia la fórmula de nᵏ a una permutación.">
              <Bag config={config} onChange={setConfig} />
            </Step>
            <Step n={3} title="Sella las reglas" hint="Cada sello recorta el número de contraseñas; debajo está su fórmula (k = casillas).">
              <Rules config={config} onChange={setConfig} />
            </Step>
          </div>
        </main>

        <Section id="calculo" title="El cálculo, paso a paso" lead="Lo que ves en la bóveda, explicado con palabras, con fórmulas y en el formato que pide el informe.">
          <div className="space-y-6">
            <Story config={config} result={result} />
            <AppliedFormulas config={config} result={result} />
            <FormalProcedure config={config} result={result} />
          </div>
        </Section>

        <Section title="Comparaciones del proyecto" lead="Se calculan solas con el mismo motor. Toca cualquiera para cargarla en la bóveda.">
          <Catalog onPick={pick} />
        </Section>

        <Section title="Parte 13 · Teoría de conjuntos" lead="Con la política completa: N son las contraseñas con al menos un número y M las que tienen al menos una mayúscula.">
          <Venn />
        </Section>

        <Section id="formulario" title="Formulario" lead="Todas las fórmulas que se usan. Voltea cada tarjeta para ver cuándo aplicarla y un ejemplo.">
          <Flashcards />
        </Section>

        <footer className="mt-20 text-xs text-ink-soft">
          Los cálculos usan enteros de precisión arbitraria (BigInt) y corren en tu navegador; no hay servidor. Las contraseñas de las
          ruedas son solo ejemplos al azar que cumplen la política. Componentes animados de{' '}
          <a className="underline" href="https://reactbits.dev" target="_blank" rel="noreferrer">React Bits</a>.
        </footer>
      </div>
    </ClickSpark>
  )
}
