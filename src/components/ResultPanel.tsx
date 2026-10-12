import type { ReactNode } from 'react'
import { alphabetSize } from '../engine/count.ts'
import { restrictionsList } from '../engine/explain.ts'
import { fmt, humanDuration, log2Big, sci } from '../engine/format.ts'
import type { Config, CountResult } from '../engine/types.ts'
import AppliedFormulas from './AppliedFormulas.tsx'
import FormalProcedure from './FormalProcedure.tsx'
import PasswordSlots from './PasswordSlots.tsx'
import Panel from './Panel.tsx'
import CountUp from './reactbits/CountUp.tsx'
import Story from './Story.tsx'

function Stat({ label, children, hint }: { label: string; children: ReactNode; hint: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-black/50">{label}</p>
      <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums">{children}</p>
      <p className="mt-0.5 text-xs text-black/50">{hint}</p>
    </div>
  )
}

export default function ResultPanel({ config, result }: { config: Config; result: CountResult }) {
  const restr = restrictionsList(config)
  const digits = result.total.toString().length
  const bits = Math.round(log2Big(result.total) * 10) / 10
  const none = result.total === 0n

  return (
    <div className="space-y-5">
      <Panel title="Respuesta">
        <p className="text-sm text-black/60">
          {none ? 'Con estas condiciones hay' : 'Pueden existir'}
        </p>
        <p
          className={`my-1 break-all font-mono text-3xl font-bold leading-tight tabular-nums sm:text-4xl ${
            none ? 'text-rose-600' : 'text-accent'
          }`}
        >
          {fmt(result.total)}
        </p>
        <p className="text-sm text-black/60">
          contraseñas distintas{!none && result.total >= 1000000n && <> (≈ {sci(result.total)})</>}.
        </p>
        <p className="mt-2 text-xs text-black/50">
          {alphabetSize(config)} caracteres · {config.length} casillas · {config.repetition ? 'con' : 'sin'} repetición
          {restr.length > 0 && ` · ${restr.join(', ')}`}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Cifras" hint="largo del número">
            <CountUp to={digits} duration={1} />
          </Stat>
          <Stat label="Bits" hint="fuerza (log₂)">
            <CountUp to={bits} duration={1} />
          </Stat>
          <Stat label="Fuerza bruta" hint="a 10⁹ intentos/s">
            <span className="text-base">{none ? '—' : humanDuration(Number(result.total) / 1e9)}</span>
          </Stat>
        </div>
      </Panel>

      <Panel title="Casilla por casilla" hint="Así se ve la contraseña: cuántas opciones hay en cada lugar.">
        <PasswordSlots config={config} result={result} />
      </Panel>

      <Panel title="¿Cómo se calcula?" hint="Explicado paso a paso.">
        <Story config={config} result={result} />
        <div className="mt-4">
          <AppliedFormulas config={config} result={result} />
        </div>
        <div className="mt-4">
          <FormalProcedure config={config} result={result} />
        </div>
      </Panel>
    </div>
  )
}
