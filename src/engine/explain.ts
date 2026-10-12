import { alphabetSize, classSizes } from './count.ts'
import { fmt, humanDuration, log2Big, productExpr, sci, sup } from './format.ts'
import type { CharClass, Config, CountResult, Term } from './types.ts'

const PLUR: Record<CharClass, string> = {
  lower: 'minúsculas', upper: 'mayúsculas', digit: 'números', symbol: 'símbolos',
}

function joinNi(items: string[]) {
  return items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} ni ${items[items.length - 1]}`
}

export function termLabel(t: Term, required: CharClass[]): string {
  if (t.excluded.length === 0) {
    return required.length ? 'Total sin exigir "al menos uno"' : 'Total'
  }
  return `Sin ${joinNi(t.excluded.map((k) => PLUR[k]))}`
}

function uniform(t: Term) {
  return t.setSizes.length > 0 && t.setSizes.every((s) => s === t.setSizes[0])
}

/** Expresión simbólica de un término, p. ej. "68¹⁰", "62 × 68⁸ × 10" o "P(10, 6)". */
export function termExpr(t: Term, repetition: boolean): string {
  if (t.value === 0n && t.factors.some((f) => f === 0)) return '0'
  if (repetition) return productExpr(t.perPosition)
  if (uniform(t)) return `P(${t.setSizes[0]}, ${t.setSizes.length})`
  const f = t.factors
  return f.length > 6 ? `${f.slice(0, 4).join(' × ')} × … × ${f[f.length - 1]}` : f.join(' × ')
}

export function restrictionsList(c: Config): string[] {
  const out: string[] = []
  if (c.requireLower) out.push('al menos una minúscula')
  if (c.requireUpper) out.push('al menos una mayúscula')
  if (c.requireDigit) out.push('al menos un número')
  if (c.requireSymbol) out.push('al menos un símbolo')
  if (c.endsWithDigit) out.push('termina en número')
  if (c.noStartSymbol) out.push('no comienza con símbolo')
  return out
}

export interface Explanation {
  positions: number[]
  principle: string
  formula: string
  substitution: string[]
  result: string
  interpretation: string[]
}

export function explain(c: Config, r: CountResult): Explanation {
  const main = r.terms[0]
  const n = alphabetSize(c)
  const k = c.length
  const hasPos = c.endsWithDigit || c.noStartSymbol
  const hasReq = r.required.length > 0

  let principle: string
  let formula: string
  const substitution: string[] = []

  if (hasReq) {
    principle = 'Complemento' + (r.required.length > 1 ? ' e inclusión–exclusión' : '') +
      ' + regla del producto' + (c.repetition ? '' : ' sin repetición')
    if (r.required.length === 1) {
      formula = 'N = |Total| − |Sin ninguno|'
    } else {
      formula = 'N = Σ (−1)^|T| · |Sin T|, sobre los subconjuntos T de condiciones'
    }
    const sym = r.terms.map((t, i) => {
      const e = termExpr(t, c.repetition)
      const piece = r.terms.length > 1 && /[×−]/.test(e) ? `(${e})` : e
      return i === 0 ? piece : `${t.sign === 1 ? '+' : '−'} ${piece}`
    })
    substitution.push(`N = ${sym.join(' ')}`)
    substitution.push(
      'N = ' + r.terms.map((t, i) => {
        const v = fmt(t.value)
        return i === 0 ? v : `${t.sign === 1 ? '+' : '−'} ${v}`
      }).join(' '),
    )
  } else if (c.repetition) {
    principle = 'Regla del producto'
    if (uniform(main)) {
      formula = 'N = nᵏ'
      substitution.push(`N = ${main.setSizes[0]}${sup(k)}`)
    } else {
      formula = 'N = n₁ × n₂ × … × nₖ  (opciones de cada posición)'
      substitution.push(`N = ${productExpr(main.perPosition)}`)
    }
  } else {
    principle = uniform(main) ? 'Permutaciones (regla del producto sin repetición)'
      : 'Regla del producto con opciones decrecientes'
    if (uniform(main)) {
      formula = 'P(n, k) = n! / (n − k)!'
      substitution.push(`P(${n}, ${k}) = ${n}! / (${n} − ${k})! = ${n}!/${Math.max(0, n - k)}!`)
    } else {
      formula = 'N = producto de las opciones, eligiendo primero la posición más restringida'
      substitution.push(`N = ${termExpr(main, false)}`)
    }
    if (k > 0 && main.factors.length) substitution.push(`N = ${main.factors.map(fmt).join(' × ')}`)
  }

  const result = `N = ${fmt(r.total)}`

  const interpretation: string[] = []
  if (r.total === 0n) {
    interpretation.push(
      'Ninguna contraseña cumple la política: las condiciones son contradictorias o el conjunto de caracteres no alcanza.',
    )
  } else {
    const bits = log2Big(r.total)
    interpretation.push(
      `Existen ${fmt(r.total)} contraseñas distintas${sci(r.total) === fmt(r.total) ? '' : ` (≈ ${sci(r.total)})`}, unos ${bits.toFixed(1)} bits de entropía.`,
    )
    interpretation.push(
      `Probando 10⁹ combinaciones por segundo, recorrerlas todas tomaría ${humanDuration(Number(r.total) / 1e9)}.`,
    )
  }
  if (c.requireDigit && c.endsWithDigit) {
    interpretation.push(
      'Nota: "termina en número" ya garantiza "al menos un número"; por eso el complemento "sin números" vale 0.',
    )
  }
  if (!c.repetition && n < k) {
    interpretation.push(`Sin repetición se necesitan al menos ${k} caracteres distintos y solo hay ${n}.`)
  }
  if (hasPos) {
    interpretation.push(
      'Las posiciones restringidas tienen distinta cantidad de opciones, por eso el producto ya no es nᵏ.',
    )
  }

  return { positions: main.perPosition, principle, formula, substitution, result, interpretation }
}

/** Texto plano del procedimiento, listo para pegar en el informe. */
export function procedureText(c: Config, r: CountResult): string {
  const e = explain(c, r)
  const restr = restrictionsList(c)
  const s = classSizes(c)
  return [
    `Política: ${c.length} caracteres; ${s.lower} minúsculas, ${s.upper} mayúsculas, ${s.digit} números, ${s.symbol} símbolos (${alphabetSize(c)} en total); ${c.repetition ? 'con' : 'sin'} repetición.`,
    `Restricciones: ${restr.length ? restr.join(', ') : 'ninguna'}.`,
    '',
    `1. Opciones por posición: ${e.positions.join(', ')}`,
    `2. Principio: ${e.principle}`,
    `3. Fórmula: ${e.formula}`,
    ...e.substitution.map((l, i) => (i === 0 ? `4. Sustitución: ${l}` : `   ${l}`)),
    `5. Resultado: ${e.result}`,
    `6. Interpretación: ${e.interpretation.join(' ')}`,
  ].join('\n')
}

/** Explicación en lenguaje cotidiano, una frase por idea. */
export function plainStory(c: Config, r: CountResult): string[] {
  const main = r.terms[0]
  const k = c.length
  const out: string[] = []
  out.push(`Imagina ${k} casilla${k === 1 ? '' : 's'} vacía${k === 1 ? '' : 's'}, una por cada carácter de la contraseña.`)
  out.push(
    c.repetition
      ? 'Como se puede repetir, cada casilla tiene sus opciones sin importar lo que pusiste en las demás.'
      : 'Como no se puede repetir, cada carácter que usas deja de estar disponible para las demás casillas: por eso las opciones van bajando.',
  )
  if (c.endsWithDigit) out.push(`La última casilla solo acepta números: ${main.setSizes[k - 1]} opciones.`)
  if (c.noStartSymbol) out.push(`La primera casilla no acepta símbolos: ${main.setSizes[0]} opciones.`)
  out.push('Para saber cuántas contraseñas hay, se multiplican las opciones de todas las casillas (regla del producto).')
  if (r.required.length > 0) {
    const names = r.required.map((x) => `${x === 'digit' ? 'un' : 'una'} ${SINGULAR[x]}`)
    const rules = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
    out.push(
      `Contar "al menos ${rules}" directamente es difícil. El truco: se cuentan todas las contraseñas y se restan las que NO cumplen ${r.required.length === 1 ? 'la regla' : 'alguna de las reglas'}.`,
    )
    if (r.required.length > 1) {
      out.push(
        'Las que fallan varias reglas a la vez se restaron más de una vez, así que se vuelven a sumar (inclusión–exclusión).',
      )
    }
  }
  return out
}

const SINGULAR: Record<CharClass, string> = {
  lower: 'minúscula', upper: 'mayúscula', digit: 'número', symbol: 'símbolo',
}
