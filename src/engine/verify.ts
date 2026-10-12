// Verificación del motor de conteo. Ejecutar con: npm test
import { compute } from './count.ts'
import type { Config } from './types.ts'

const base: Config = {
  length: 1, lower: 0, upper: 0, digits: 0, symbols: 0, repetition: true,
  requireLower: false, requireUpper: false, requireDigit: false, requireSymbol: false,
  endsWithDigit: false, noStartSymbol: false,
}

/** Enumera todas las cadenas y cuenta las válidas (método independiente). */
function brute(c: Config): bigint {
  const classes: string[] = []
  for (let i = 0; i < c.lower; i++) classes.push('l')
  for (let i = 0; i < c.upper; i++) classes.push('u')
  for (let i = 0; i < c.digits; i++) classes.push('d')
  for (let i = 0; i < c.symbols; i++) classes.push('s')
  const n = classes.length
  let count = 0n
  const idx: number[] = []
  const rec = (pos: number) => {
    if (pos === c.length) {
      const cl = idx.map((i) => classes[i])
      if (c.requireLower && !cl.includes('l')) return
      if (c.requireUpper && !cl.includes('u')) return
      if (c.requireDigit && !cl.includes('d')) return
      if (c.requireSymbol && !cl.includes('s')) return
      if (c.endsWithDigit && cl[c.length - 1] !== 'd') return
      if (c.noStartSymbol && cl[0] === 's') return
      count++
      return
    }
    for (let i = 0; i < n; i++) {
      if (!c.repetition && idx.includes(i)) continue
      idx.push(i)
      rec(pos + 1)
      idx.pop()
    }
  }
  rec(0)
  return count
}

let checked = 0
const alphabets = [[2, 2, 2, 1], [1, 3, 2, 2], [3, 1, 1, 0], [0, 2, 2, 2], [2, 0, 3, 1]]
for (const [lower, upper, digits, symbols] of alphabets) {
  for (let length = 1; length <= 5; length++) {
    for (let flags = 0; flags < 128; flags++) {
      const c: Config = {
        ...base, length, lower, upper, digits, symbols,
        repetition: !!(flags & 1),
        requireLower: !!(flags & 2), requireUpper: !!(flags & 4),
        requireDigit: !!(flags & 8), requireSymbol: !!(flags & 16),
        endsWithDigit: !!(flags & 32), noStartSymbol: !!(flags & 64),
      }
      const got = compute(c).total
      const want = brute(c)
      if (got !== want) throw new Error(`Mismatch ${JSON.stringify(c)}: motor=${got} bruta=${want}`)
      checked++
    }
  }
}
console.log(`OK fuerza bruta: ${checked} configuraciones coinciden`)

// Valores conocidos calculados a mano (independientes del motor)
const P = (n: bigint, r: bigint) => { let p = 1n; for (let i = 0n; i < r; i++) p *= n - i; return p }
const full: Config = { ...base, length: 10, lower: 26, upper: 26, digits: 10, symbols: 6 }
const known: [string, Config, bigint][] = [
  ['P1 A 10^6', { ...base, length: 6, digits: 10 }, 10n ** 6n],
  ['P1 B P(10,6)', { ...base, length: 6, digits: 10, repetition: false }, P(10n, 6n)],
  ['P2 A 26^8', { ...base, length: 8, lower: 26 }, 26n ** 8n],
  ['P2 B P(26,8)', { ...base, length: 8, lower: 26, repetition: false }, P(26n, 8n)],
  ['P3 52^8', { ...base, length: 8, lower: 26, upper: 26 }, 52n ** 8n],
  ['P4 62^8', { ...base, length: 8, lower: 26, upper: 26, digits: 10 }, 62n ** 8n],
  ['P5 68^10', full, 68n ** 10n],
  ['P6 68^10-58^10', { ...full, requireDigit: true }, 68n ** 10n - 58n ** 10n],
  ['P7 68^10-42^10', { ...full, requireUpper: true }, 68n ** 10n - 42n ** 10n],
  ['P8 incl-excl', { ...full, requireDigit: true, requireUpper: true }, 68n ** 10n - 58n ** 10n - 42n ** 10n + 32n ** 10n],
  ['P9 68^9*10', { ...full, endsWithDigit: true }, 68n ** 9n * 10n],
  ['P10 62*68^8*10', { ...full, endsWithDigit: true, noStartSymbol: true }, 62n * 68n ** 8n * 10n],
  ['P11 sin rep', { ...full, endsWithDigit: true, noStartSymbol: true, repetition: false },
    10n * 61n * 66n * 65n * 64n * 63n * 62n * 61n * 60n * 59n],
  ['P15 C 62*68^9', { ...full, noStartSymbol: true }, 62n * 68n ** 9n],
  ['P15 E P(68,10)', { ...full, repetition: false }, P(68n, 10n)],
  // Parte 16: terminar en número ya garantiza "al menos un número"
  ['P16', { ...full, requireUpper: true, requireDigit: true, endsWithDigit: true, noStartSymbol: true },
    62n * 68n ** 8n * 10n - 36n * 42n ** 8n * 10n],
]
for (const [name, cfg, want] of known) {
  const got = compute(cfg).total
  if (got !== want) throw new Error(`${name}: motor=${got} esperado=${want}`)
  console.log(`OK ${name.padEnd(16)} ${got.toLocaleString('en-US')}`)
}

// Parte 13: identidades de conjuntos contra conteo directo
import { setAnalysis } from './formulas.ts'
const rows = Object.fromEntries(setAnalysis().map((r) => [r.symbol, r.value]))
const direct: [string, bigint][] = [
  ['N ∪ M', 68n ** 10n - 32n ** 10n], // complemento: sin número y sin mayúscula usa 68−10−26 = 32
  ['N − M', 42n ** 10n - 32n ** 10n], // sin mayúscula (42) pero con número
  ['S', 68n ** 10n - 62n ** 10n],
]
for (const [k, want] of direct) {
  if (rows[k] !== want) throw new Error(`Parte 13 ${k}: motor=${rows[k]} esperado=${want}`)
  console.log(`OK Parte 13 ${k.padEnd(6)} ${want.toLocaleString('en-US')}`)
}
