const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

export const sup = (n: number | string) => String(n).replace(/\d/g, (d) => SUP[d])

export const fmt = (n: bigint | number) => n.toLocaleString('en-US')

/** 1.23 × 10¹⁹ (o el número completo si es pequeño). */
export function sci(n: bigint): string {
  const s = n.toString()
  if (s.length <= 6) return fmt(n)
  const mant = (s[0] + '.' + s.slice(1, 4)).replace(/\.?0+$/, '')
  return `${mant} × 10${sup(s.length - 1)}`
}

export function log2Big(n: bigint): number {
  if (n <= 0n) return 0
  const bin = n.toString(2)
  if (bin.length <= 53) return Math.log2(Number(n))
  return Math.log2(parseInt(bin.slice(0, 53), 2)) + (bin.length - 53)
}

export function humanDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'un tiempo astronómico'
  if (seconds < 1) return 'menos de 1 segundo'
  const units: [string, number][] = [
    ['segundos', 60], ['minutos', 60], ['horas', 24], ['días', 365.25],
  ]
  let v = seconds
  for (const [name, div] of units) {
    if (v < div) return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${name}`
    v /= div
  }
  if (v < 1e6) return `${fmt(Math.round(v))} años`
  return `≈ ${sci(BigInt(Math.floor(v)))} años`
}

/** Agrupa factores consecutivos iguales: [67,68,68,10] → "67 × 68² × 10". */
export function productExpr(factors: number[]): string {
  if (factors.length === 0) return '1'
  const parts: string[] = []
  let i = 0
  while (i < factors.length) {
    let j = i
    while (j < factors.length && factors[j] === factors[i]) j++
    const run = j - i
    parts.push(run === 1 ? String(factors[i]) : `${factors[i]}${sup(run)}`)
    i = j
  }
  return parts.join(' × ')
}
