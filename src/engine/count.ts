import type { CharClass, Config, CountResult, Term } from './types.ts'

export const CLASS_ORDER: CharClass[] = ['lower', 'upper', 'digit', 'symbol']

const clampInt = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0)

export function classSizes(c: Config): Record<CharClass, number> {
  return {
    lower: clampInt(c.lower),
    upper: clampInt(c.upper),
    digit: clampInt(c.digits),
    symbol: clampInt(c.symbols),
  }
}

export function alphabetSize(c: Config): number {
  const s = classSizes(c)
  return s.lower + s.upper + s.digit + s.symbol
}

export function requiredClasses(c: Config): CharClass[] {
  const out: CharClass[] = []
  if (c.requireLower) out.push('lower')
  if (c.requireUpper) out.push('upper')
  if (c.requireDigit) out.push('digit')
  if (c.requireSymbol) out.push('symbol')
  return out
}

/** Tamaño del conjunto de caracteres permitido en la posición i (0-based). */
function setSizeAt(c: Config, i: number, excluded: readonly CharClass[]): number {
  const sizes = classSizes(c)
  const last = clampInt(c.length) - 1
  let total = 0
  for (const k of CLASS_ORDER) {
    if (excluded.includes(k)) continue
    if (c.endsWithDigit && i === last && k !== 'digit') continue
    if (c.noStartSymbol && i === 0 && k === 'symbol') continue
    total += sizes[k]
  }
  return total
}

/**
 * Cuenta las cadenas cuya posición i toma valores de un conjunto de tamaño setSizes[i].
 * Con repetición es el producto simple. Sin repetición se usa que los conjuntos están
 * anidados (último ⊆ primero ⊆ intermedias): se elige primero la posición más
 * restringida y a la k-ésima elegida le quedan |S| − k opciones.
 */
function evaluate(setSizes: number[], repetition: boolean) {
  const n = setSizes.length
  const perPosition = new Array<number>(n)
  let factors: number[]
  if (repetition) {
    for (let i = 0; i < n; i++) perPosition[i] = setSizes[i]
    factors = [...perPosition]
  } else {
    const order = setSizes.map((_, i) => i).sort((a, b) => setSizes[a] - setSizes[b] || a - b)
    factors = []
    order.forEach((idx, k) => {
      const f = Math.max(0, setSizes[idx] - k)
      perPosition[idx] = f
      factors.push(f)
    })
  }
  let value = 1n
  for (const f of factors) value *= BigInt(f)
  return { perPosition, factors, value }
}

export function compute(c: Config): CountResult {
  const length = clampInt(c.length)
  const required = requiredClasses(c)
  const terms: Term[] = []

  for (let mask = 0; mask < 1 << required.length; mask++) {
    const excluded = required.filter((_, b) => mask & (1 << b))
    const setSizes = Array.from({ length }, (_, i) => setSizeAt(c, i, excluded))
    const { perPosition, factors, value } = evaluate(setSizes, c.repetition)
    terms.push({
      excluded,
      sign: excluded.length % 2 === 0 ? 1 : -1,
      setSizes,
      perPosition,
      factors,
      value,
    })
  }

  const total = terms.reduce((acc, t) => acc + (t.sign === 1 ? t.value : -t.value), 0n)
  return { total, terms, required }
}
