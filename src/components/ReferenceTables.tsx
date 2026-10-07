import type { ReactNode } from 'react'
import { alphabetSize, compute } from '../engine/count.ts'
import { fmt } from '../engine/format.ts'
import { lengthTable, policyTable, scenarioTable } from '../engine/presets.ts'
import type { Config } from '../engine/types.ts'

interface Props {
  onPick: (c: Config) => void
}

const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-black/60'
const td = 'px-3 py-2 text-sm'
const rowCls = 'cursor-pointer border-t border-black/5 hover:bg-accent/5'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <h3 className="border-b border-black/10 px-4 py-3 text-sm font-semibold">{title}</h3>
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}

export default function ReferenceTables({ onPick }: Props) {
  const scenarioBase = compute(scenarioTable[0].config).total

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Card title="Parte 12 · Comparación de políticas (clic en una fila para ver el procedimiento)">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className={th}>Política</th>
                <th className={th}>Caracteres</th>
                <th className={th}>Longitud</th>
                <th className={th}>Restricciones</th>
                <th className={th}>Repetición</th>
                <th className={`${th} text-right`}>Posibilidades</th>
              </tr>
            </thead>
            <tbody>
              {policyTable.map((r) => (
                <tr key={r.id} className={rowCls} onClick={() => onPick(r.config)}>
                  <td className={`${td} font-medium`}>{r.label}</td>
                  <td className={td}>{alphabetSize(r.config)}</td>
                  <td className={td}>{r.config.length}</td>
                  <td className={td}>{r.restrictions}</td>
                  <td className={td}>{r.config.repetition ? 'Sí' : 'No'}</td>
                  <td className={`${td} text-right font-mono tabular-nums`}>{fmt(compute(r.config).total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Parte 14 · Análisis de longitud (68 caracteres)">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Longitud</th>
              <th className={`${th} text-right`}>Posibilidades</th>
            </tr>
          </thead>
          <tbody>
            {lengthTable.map((r) => (
              <tr key={r.id} className={rowCls} onClick={() => onPick(r.config)}>
                <td className={`${td} font-medium`}>{r.config.length}</td>
                <td className={`${td} text-right font-mono tabular-nums`}>{fmt(compute(r.config).total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Parte 15 · Análisis de restricciones (10 caracteres)">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Escenario</th>
              <th className={`${th} text-right`}>Posibilidades</th>
              <th className={`${th} text-right`}>% de A</th>
            </tr>
          </thead>
          <tbody>
            {scenarioTable.map((r) => {
              const total = compute(r.config).total
              const pct = Number((total * 10000n) / scenarioBase) / 100
              return (
                <tr key={r.id} className={rowCls} onClick={() => onPick(r.config)}>
                  <td className={td}>
                    <span className="font-medium">{r.label}</span>
                    <span className="block text-xs text-black/60">{r.note}</span>
                  </td>
                  <td className={`${td} text-right font-mono tabular-nums`}>{fmt(total)}</td>
                  <td className={`${td} text-right font-mono tabular-nums`}>{pct.toFixed(2)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
