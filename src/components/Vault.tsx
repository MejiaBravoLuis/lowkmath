import { useEffect, useMemo, useRef, useState } from 'react'
import { alphabetSize } from '../engine/count.ts'
import { restrictionsList } from '../engine/explain.ts'
import { fmt, humanDuration, log2Big, productExpr, sci } from '../engine/format.ts'
import { randomAllowed, type Tok } from '../engine/sample.ts'
import type { Config, CountResult } from '../engine/types.ts'
import { reducedMotion } from '../ui.ts'
import Odometer from './Odometer.tsx'
import Padlock from './Padlock.tsx'
import CountUp from './reactbits/CountUp.tsx'
import Magnet from './reactbits/Magnet.tsx'

interface Props {
  config: Config
  result: CountResult
  sample: Tok[] | null
  spin: number
  onSpin: () => void
  onLength: (n: number) => void
}

function Dial({ tok, spinning, settled, options, onClick, config, i }: {
  tok: Tok | null; spinning: boolean; settled: boolean; options: number; onClick: () => void; config: Config; i: number
}) {
  const prev = useMemo(() => randomAllowed(config, i)?.ch ?? '·', [config, i, tok?.ch])
  const next = useMemo(() => randomAllowed(config, i)?.ch ?? '·', [config, i, tok?.ch])
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        data-kind={tok?.kind}
        onClick={onClick}
        aria-label={`Casilla ${i + 1}: ${options} opciones. Girar otra contraseña`}
        className={`dial ${spinning ? 'is-spinning' : ''} ${settled ? 'is-settled' : ''}`}
      >
        <span className="dial-band" />
        <span className="dial-col" aria-hidden="true">
          <span className="dial-prev">{prev}</span>
          <span className="dial-cur">{tok?.ch ?? '·'}</span>
          <span className="dial-next">{next}</span>
        </span>
      </button>
      <span className="font-mono text-[11px] font-semibold text-ink-soft" title={`${options} opciones en la casilla ${i + 1}`}>{options}</span>
    </div>
  )
}

export default function Vault({ config, result, sample, spin, onSpin, onLength }: Props) {
  const k = Math.max(0, config.length)
  const [shown, setShown] = useState<(Tok | null)[]>([])
  const [phase, setPhase] = useState<('spin' | 'done' | 'idle')[]>([])
  const timers = useRef<number[]>([])
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const target = sample ?? Array.from({ length: k }, () => null)
    if (reducedMotion()) {
      setShown(target)
      setPhase(target.map(() => 'idle'))
      return
    }
    setPhase(target.map(() => 'spin'))
    const phaseDone = { current: [] as boolean[] }
    const tick = window.setInterval(() => {
      setShown(() => target.map((t, i) => (phaseDone.current[i] ? t : randomAllowed(configRef.current, i) ?? null)))
    }, 85)
    timers.current.push(tick)
    target.forEach((t, i) => {
      timers.current.push(
        window.setTimeout(() => {
          phaseDone.current[i] = true
          setShown((cur) => { const n = [...cur]; n[i] = t; return n })
          setPhase((p) => { const n = [...p]; n[i] = 'done'; return n })
        }, 320 + i * 75),
      )
    })
    timers.current.push(window.setTimeout(() => clearInterval(tick), 320 + target.length * 75 + 100))
    return () => { timers.current.forEach((t) => { clearTimeout(t); clearInterval(t) }) }
  }, [sample, spin, k])

  const none = result.total === 0n
  const bits = Math.round(log2Big(result.total) * 10) / 10
  const digits = result.total.toString().length
  const time = none ? '—' : humanDuration(Number(result.total) / 1e9)
  const per = result.terms[0].perPosition
  const restr = restrictionsList(config)
  const hasMust = result.required.length > 0

  return (
    <section aria-label="La bóveda" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold">Casillas</span>
          <div className="flex items-center gap-1.5 rounded-full bg-paper p-1 shadow-[0_3px_0_var(--color-steel-deep)]">
            <button type="button" className="key !size-8 !rounded-full text-base" disabled={k <= 1} aria-label="Quitar una casilla" onClick={() => onLength(Math.max(1, k - 1))}>−</button>
            <span className="w-8 text-center font-mono text-base font-bold tabular-nums" aria-live="polite">{k}</span>
            <button type="button" className="key !size-8 !rounded-full text-base" disabled={k >= 64} aria-label="Agregar una casilla" onClick={() => onLength(Math.min(64, k + 1))}>+</button>
          </div>
        </div>
        <Magnet padding={70} magnetStrength={4} maxOffset={14}>
          <button type="button" onClick={onSpin} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#000a] transition active:translate-y-0.5 active:shadow-none">
            🎲 Girar otra
          </button>
        </Magnet>
      </div>

      <div className="rail">
        <div className="flex flex-wrap items-start justify-center gap-x-2.5 gap-y-3">
          {Array.from({ length: k }, (_, i) => (
            <Dial
              key={i}
              i={i}
              config={config}
              tok={shown[i] ?? null}
              spinning={phase[i] === 'spin'}
              settled={phase[i] === 'done'}
              options={per[i] ?? 0}
              onClick={onSpin}
            />
          ))}
          {k < 64 && (
            <button type="button" className="dial-ghost" aria-label="Agregar una casilla" onClick={() => onLength(k + 1)}>+</button>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">
          El número bajo cada rueda son las <strong>opciones de esa casilla</strong>. Toca una rueda para girar otra contraseña posible.
        </p>
      </div>

      {(hasMust || restr.length > 0) && (
        <ul className="flex flex-wrap items-center gap-2 text-xs" aria-label="Reglas activas">
          {result.required.map((r) => (
            <li key={r} data-kind={r} className="rounded-full bg-[var(--k-soft)] px-3 py-1 font-semibold text-[var(--k-deep)]">
              ≥ 1 {r === 'lower' ? 'minúscula' : r === 'upper' ? 'mayúscula' : r === 'digit' ? 'número' : 'símbolo'}
            </li>
          ))}
          {config.endsWithDigit && <li data-kind="digit" className="rounded-full bg-[var(--k-soft)] px-3 py-1 font-semibold text-[var(--k-deep)]">termina en número</li>}
          {config.noStartSymbol && <li data-kind="symbol" className="rounded-full bg-[var(--k-soft)] px-3 py-1 font-semibold text-[var(--k-deep)]">no empieza con símbolo</li>}
          {!config.repetition && <li className="rounded-full bg-steel px-3 py-1 font-semibold text-ink">sin repetir</li>}
        </ul>
      )}

      <div className="odo" aria-live="polite">
        <p className="mb-1 text-center text-xs text-white/70">
          {none ? 'Con estas reglas hay' : 'Pueden existir exactamente'}
        </p>
        <Odometer value={result.total.toString()} />
        <p className="mt-1.5 text-center text-xs text-white/70">
          contraseñas distintas{!none && result.total >= 1000000n && <> · ≈ {sci(result.total)}</>}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center">
        <Chip label="cifras"><CountUp to={digits} duration={1} /></Chip>
        <Chip label="bits de fuerza"><CountUp to={bits} duration={1} /></Chip>
        <Chip label="caracteres"><CountUp to={alphabetSize(config)} duration={0.8} /></Chip>
      </div>

      <Padlock bits={bits} none={none} time={time} />

      <p className="overflow-x-auto rounded-2xl bg-paper/70 px-4 py-2.5 font-mono text-[12px] text-ink-soft">
        <span className="font-sans font-semibold text-ink">Casilla por casilla{hasMust ? ' (antes de exigir “al menos uno”)' : ''}: </span>
        {productExpr(per)} {result.terms.length === 1 && <>= {fmt(result.total)}</>}
      </p>
    </section>
  )
}

function Chip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper px-2 py-2.5 shadow-[0_3px_0_var(--color-steel-deep)]">
      <p className="font-mono text-xl font-bold tabular-nums">{children}</p>
      <p className="text-[11px] text-ink-soft">{label}</p>
    </div>
  )
}
