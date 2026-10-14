import { useState } from 'react'
import { fmt } from '../engine/format.ts'
import { setAnalysis } from '../engine/formulas.ts'

type Region = 'a' | 'b' | 'c' | 'd'
interface Pick { id: string; symbol: string; meaning: string; formula: string; value: bigint; regions: Region[] }

/** Parte 13 como diagrama de Venn: cada región se toca y muestra qué cuenta, su fórmula y su valor. */
export default function Venn() {
  const rows = setAnalysis()
  const get = (s: string) => rows.find((r) => r.symbol === s)!
  const U = get('U').value, N = get('N').value, M = get('M').value, NM = get('N ∩ M').value, S = get('S').value
  const picks: Pick[] = [
    { id: 'U', symbol: 'U', meaning: get('U').meaning, formula: get('U').formula, value: U, regions: ['a', 'b', 'c', 'd'] },
    { id: 'N', symbol: 'N', meaning: get('N').meaning, formula: get('N').formula, value: N, regions: ['a', 'b'] },
    { id: 'M', symbol: 'M', meaning: get('M').meaning, formula: get('M').formula, value: M, regions: ['b', 'c'] },
    { id: 'NM', symbol: 'N ∩ M', meaning: get('N ∩ M').meaning, formula: get('N ∩ M').formula, value: NM, regions: ['b'] },
    { id: 'NuM', symbol: 'N ∪ M', meaning: get('N ∪ M').meaning, formula: get('N ∪ M').formula, value: N + M - NM, regions: ['a', 'b', 'c'] },
    { id: 'N-M', symbol: 'N − M', meaning: get('N − M').meaning, formula: get('N − M').formula, value: N - NM, regions: ['a'] },
    { id: 'M-N', symbol: 'M − N', meaning: 'Tienen una mayúscula pero ningún número', formula: '|M − N| = |M| − |N ∩ M|', value: M - NM, regions: ['c'] },
    { id: 'out', symbol: '(N ∪ M)ᶜ', meaning: 'No tienen número ni mayúscula', formula: '|U| − |N ∪ M|', value: U - (N + M - NM), regions: ['d'] },
  ]
  const [sel, setSel] = useState('NM')
  const cur = picks.find((p) => p.id === sel)!
  const on = (r: Region) => cur.regions.includes(r)
  const byRegion: Record<Region, string> = { a: 'N-M', b: 'NM', c: 'M-N', d: 'out' }

  const fill = (r: Region, color: string) => (on(r) ? color : 'rgba(255,255,255,.55)')

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 440 290" className="w-full" role="group" aria-label="Diagrama de Venn de N y M dentro de U">
        <rect x="4" y="4" width="432" height="282" rx="30" fill={fill('d', '#ffd6ea')} stroke="#15163a" strokeWidth="3" className="cursor-pointer transition" onClick={() => setSel('out')} />
        <text x="26" y="34" className="font-display" fontSize="18" fontWeight="700" fill="#15163a">U</text>
        <defs><clipPath id="clipN"><circle cx="165" cy="150" r="98" /></clipPath></defs>
        <g className="cursor-pointer" onClick={() => setSel('N-M')}>
          <circle cx="165" cy="150" r="98" fill={fill('a', '#ffb000')} stroke="#15163a" strokeWidth="3" style={{ transition: 'fill .3s' }} />
        </g>
        <g className="cursor-pointer" onClick={() => setSel('M-N')}>
          <circle cx="275" cy="150" r="98" fill={fill('c', '#e8399b')} stroke="#15163a" strokeWidth="3" style={{ transition: 'fill .3s' }} />
        </g>
        <g clipPath="url(#clipN)" className="cursor-pointer" onClick={() => setSel('NM')}>
          <circle cx="275" cy="150" r="98" fill={fill('b', '#2f6bff')} stroke="#15163a" strokeWidth="3" style={{ transition: 'fill .3s' }} />
        </g>
        <g fontWeight="700" fill="#15163a" textAnchor="middle" pointerEvents="none">
          <text x="110" y="145" fontSize="26" className="font-display">N</text>
          <text x="110" y="166" fontSize="11" fontWeight="600">solo números</text>
          <text x="330" y="145" fontSize="26" className="font-display">M</text>
          <text x="330" y="166" fontSize="11" fontWeight="600">solo mayúsculas</text>
          <text x="220" y="148" fontSize="16" fill={on('b') ? '#fff' : '#15163a'}>N ∩ M</text>
          <text x="220" y="166" fontSize="11" fontWeight="600" fill={on('b') ? '#fff' : '#15163a'}>ambas</text>
          <text x="220" y="272" fontSize="12" fontWeight="600">ninguna</text>
        </g>
      </svg>

      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Conjuntos">
          {picks.map((p) => (
            <button
              key={p.id} type="button" role="tab" aria-selected={p.id === sel} onClick={() => setSel(p.id)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-sm font-bold transition duration-200 ${p.id === sel ? 'bg-ink text-white -translate-y-0.5 shadow-[0_4px_0_#000a]' : 'bg-paper shadow-[0_3px_0_var(--color-steel-deep)] hover:-translate-y-0.5'}`}
            >
              {p.symbol}
            </button>
          ))}
        </div>
        <div className="rounded-3xl bg-paper p-5 shadow-[0_4px_0_var(--color-steel-deep)]" aria-live="polite">
          <p className="text-sm text-ink-soft">{cur.meaning}</p>
          <p className="mt-2 overflow-x-auto font-mono text-[13px] text-lower">{cur.formula}</p>
          <p className="mt-2 break-all font-mono text-2xl font-bold tabular-nums">{fmt(cur.value)}</p>
          <p className="mt-1 text-xs text-ink-soft">Con la política completa: 10 casillas, 68 caracteres, con repetición. Inclusión–exclusión: |N ∪ M| = |N| + |M| − |N ∩ M|.</p>
        </div>
        <p className="mt-3 text-xs text-ink-soft">También puedes tocar directamente una región del diagrama. (Símbolos S: {fmt(S)} contraseñas con al menos un símbolo.)</p>
      </div>
    </div>
  )
}
