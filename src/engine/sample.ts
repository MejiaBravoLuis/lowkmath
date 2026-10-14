import { CLASS_ORDER, classSizes, requiredClasses } from './count.ts'
import type { CharClass, Config } from './types.ts'

/** Caracteres de cada tipo, en el orden en que "se activan" al subir la cantidad. */
export const BASE: Record<CharClass, string> = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  symbol: '!@#$%&',
}

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUB[Number(d)])

/** Los primeros `size` caracteres del tipo; si piden más de los reales, se numeran (a₂, b₂, …). */
export function poolOf(kind: CharClass, size: number): string[] {
  const base = BASE[kind]
  const n = Math.max(0, Math.floor(size))
  return Array.from({ length: n }, (_, i) =>
    i < base.length ? base[i] : `${base[i % base.length]}${sub(Math.floor(i / base.length) + 1)}`,
  )
}

export interface Tok {
  ch: string
  kind: CharClass
}

/** Clases permitidas en la posición i (mismas reglas de posición que usa el conteo). */
export function allowedClasses(c: Config, i: number): CharClass[] {
  const last = Math.max(0, Math.floor(c.length)) - 1
  return CLASS_ORDER.filter((k) => {
    if (c.endsWithDigit && i === last && k !== 'digit') return false
    if (c.noStartSymbol && i === 0 && k === 'symbol') return false
    return true
  })
}

/** Todos los caracteres que pueden ir en la posición i. */
export function positionPool(c: Config, i: number): Tok[] {
  const sizes = classSizes(c)
  const out: Tok[] = []
  for (const kind of allowedClasses(c, i)) for (const ch of poolOf(kind, sizes[kind])) out.push({ ch, kind })
  return out
}

/**
 * Una contraseña al azar que cumple la política (solo para la demostración visual:
 * no interviene en ningún conteo). Devuelve null si no existe ninguna.
 */
export function samplePassword(c: Config, rand: () => number = Math.random): Tok[] | null {
  const k = Math.max(0, Math.floor(c.length))
  const required = requiredClasses(c)
  const pools = Array.from({ length: k }, (_, i) => positionPool(c, i))
  if (k === 0 || pools.some((p) => p.length === 0)) return null

  const pick = (pool: Tok[], used: Set<string>): Tok | null => {
    for (let t = 0; t < 40; t++) {
      const tok = pool[Math.floor(rand() * pool.length)]
      if (c.repetition || !used.has(tok.ch)) return tok
    }
    const free = c.repetition ? pool : pool.filter((t) => !used.has(t.ch))
    return free.length ? free[Math.floor(rand() * free.length)] : null
  }

  // Sin repetición se eligen primero las casillas más restringidas (conjuntos anidados).
  const order = pools.map((_, i) => i)
  if (!c.repetition) order.sort((a, b) => pools[a].length - pools[b].length || a - b)

  const build = (forced: Map<number, Tok>): Tok[] | null => {
    const out = new Array<Tok>(k)
    const used = new Set<string>()
    for (const [i, t] of forced) {
      out[i] = t
      used.add(t.ch)
    }
    for (const i of order) {
      if (out[i]) continue
      const t = pick(pools[i], used)
      if (!t) return null
      out[i] = t
      used.add(t.ch)
    }
    return out
  }

  const ok = (pw: Tok[]) => required.every((r) => pw.some((t) => t.kind === r))

  for (let attempt = 0; attempt < 300; attempt++) {
    const pw = build(new Map())
    if (pw && ok(pw)) return pw
    if (!pw) return null
  }

  // Poco probable por azar: se colocan primero las clases exigidas, cada una en su propia casilla.
  for (let attempt = 0; attempt < 60; attempt++) {
    const forced = new Map<number, Tok>()
    const used = new Set<string>()
    let failed = false
    for (const r of required) {
      const slots = pools.map((_, i) => i).filter((i) => !forced.has(i) && pools[i].some((t) => t.kind === r))
      if (!slots.length) { failed = true; break }
      const i = slots[Math.floor(rand() * slots.length)]
      const t = pick(pools[i].filter((x) => x.kind === r), used)
      if (!t) { failed = true; break }
      forced.set(i, t)
      used.add(t.ch)
    }
    if (failed) continue
    const pw = build(forced)
    if (pw && ok(pw)) return pw
  }
  return null
}

/** Carácter número `i` del tipo (mismo criterio que poolOf, sin crear toda la lista). */
export function charFor(kind: CharClass, i: number): string {
  const base = BASE[kind]
  return i < base.length ? base[i] : `${base[i % base.length]}${sub(Math.floor(i / base.length) + 1)}`
}

/** Un carácter al azar de los permitidos en la posición i, para animar las ruedas. */
export function randomAllowed(c: Config, i: number, rand: () => number = Math.random): Tok | null {
  const sizes = classSizes(c)
  const kinds = allowedClasses(c, i).filter((k) => sizes[k] > 0)
  const total = kinds.reduce((a, k) => a + sizes[k], 0)
  if (total === 0) return null
  let r = Math.floor(rand() * total)
  for (const kind of kinds) {
    if (r < sizes[kind]) return { ch: charFor(kind, r), kind }
    r -= sizes[kind]
  }
  return null
}
