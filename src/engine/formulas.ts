import { alphabetSize, classSizes, compute } from './count.ts'
import { termExpr } from './explain.ts'
import { fmt, productExpr, sup } from './format.ts'
import { defaultConfig } from './presets.ts'
import type { Config, CountResult } from './types.ts'

/** Entrada del formulario: una fórmula, cuándo se usa y un ejemplo. */
export interface FormulaDoc {
  id: string
  name: string
  general: string
  when: string
  example: string
}

export const FORMULAS: FormulaDoc[] = [
  {
    id: 'alfabeto', name: 'Total de caracteres', general: 'n = l + u + d + s',
    when: 'Se suman los caracteres de cada tipo (l minúsculas, u mayúsculas, d números, s símbolos). Los grupos no se solapan.',
    example: 'n = 26 + 26 + 10 + 6 = 68',
  },
  {
    id: 'producto', name: 'Regla del producto', general: 'N = n₁ · n₂ ⋯ nₖ',
    when: 'Una contraseña se arma en k pasos (casillas) y cada paso tiene nᵢ opciones: el total es el producto.',
    example: 'N = 62 · 68⁸ · 10',
  },
  {
    id: 'potencia', name: 'Con repetición', general: 'N = nᵏ',
    when: 'Caso particular del producto: las k casillas tienen las mismas n opciones porque los caracteres se pueden repetir.',
    example: 'N = 10⁶ = 1,000,000',
  },
  {
    id: 'factorial', name: 'Factorial', general: 'n! = n · (n − 1) ⋯ 2 · 1,  0! = 1',
    when: 'Cuenta las formas de ordenar n elementos. Aparece dentro de las permutaciones.',
    example: '5! = 5 · 4 · 3 · 2 · 1 = 120',
  },
  {
    id: 'permutacion', name: 'Sin repetición (permutaciones)', general: 'P(n, k) = n! / (n − k)! = n · (n − 1) ⋯ (n − k + 1)',
    when: 'Se eligen k caracteres distintos y el orden importa: cada carácter usado deja una opción menos.',
    example: 'P(10, 6) = 10 · 9 · 8 · 7 · 6 · 5 = 151,200',
  },
  {
    id: 'posicion', name: 'Restricción de posición', general: 'N = n₁ · n₂ ⋯ nₖ,  con nᵢ distinto en la casilla restringida',
    when: 'Si una casilla tiene condición (p. ej. la última solo acepta números), esa casilla usa menos opciones y las demás siguen con n.',
    example: 'Termina en número: N = n⁹ · d = 68⁹ · 10',
  },
  {
    id: 'posicion-sin-rep', name: 'Posición y sin repetición', general: 'N = |S₁| · (|S₂| − 1) · (|S₃| − 2) ⋯',
    when: 'Se ordenan las casillas de la más restringida a la menos restringida. Cada carácter ya usado resta una opción a las siguientes.',
    example: 'N = 10 · 61 · 66 · 65 ⋯ 59',
  },
  {
    id: 'complemento', name: 'Complemento', general: '|A| = |U| − |Aᶜ|',
    when: 'Es más fácil contar lo que NO cumple y restarlo del total. U es el universo (todas las contraseñas) y Aᶜ las que no cumplen.',
    example: 'N = 68¹⁰ − 58¹⁰',
  },
  {
    id: 'al-menos-uno', name: '"Al menos uno" de un tipo', general: 'N = nᵏ − (n − c)ᵏ',
    when: 'c es la cantidad de caracteres del tipo exigido. "Ninguno de ese tipo" usa solo los n − c restantes.',
    example: 'Al menos un número: 68¹⁰ − (68 − 10)¹⁰ = 68¹⁰ − 58¹⁰',
  },
  {
    id: 'inclusion-exclusion', name: 'Inclusión–exclusión (dos reglas)', general: '|A ∩ B| = |U| − |Aᶜ| − |Bᶜ| + |Aᶜ ∩ Bᶜ|',
    when: 'Para exigir dos reglas "al menos uno" a la vez. Las que fallan ambas se restaron dos veces, por eso se suman una vez.',
    example: 'N = 68¹⁰ − 58¹⁰ − 42¹⁰ + 32¹⁰',
  },
  {
    id: 'union', name: 'Unión de conjuntos', general: '|A ∪ B| = |A| + |B| − |A ∩ B|',
    when: 'Cuenta lo que cumple A, B o ambas, sin contar dos veces lo que está en las dos.',
    example: '|N ∪ M| = |N| + |M| − |N ∩ M|',
  },
  {
    id: 'diferencia', name: 'Diferencia de conjuntos', general: '|A − B| = |A| − |A ∩ B|',
    when: 'Cuenta lo que cumple A pero no B.',
    example: '|N − M| = |N| − |N ∩ M|',
  },
  {
    id: 'longitud', name: 'Crecimiento con la longitud', general: 'N(k + 1) = n · N(k)',
    when: 'Cada carácter extra multiplica el espacio por n: el crecimiento es exponencial, no lineal.',
    example: '68⁸ = 68² · 68⁶',
  },
  {
    id: 'bits', name: 'Fuerza en bits', general: 'bits = log₂ N = k · log₂ n',
    when: 'Mide el tamaño del espacio en bits (con repetición y sin restricciones). Cada bit duplica el esfuerzo de fuerza bruta.',
    example: '10 · log₂ 68 ≈ 60.9 bits',
  },
]

/** Fórmula aplicada a la política actual: general + sustituida con los números reales. */
export interface Applied {
  title: string
  general: string
  substituted: string
  why: string
}

export function alphabetLine(c: Config): string {
  const s = classSizes(c)
  return `n = ${s.lower} + ${s.upper} + ${s.digit} + ${s.symbol} = ${alphabetSize(c)}`
}

export function appliedFormulas(c: Config, r: CountResult): Applied[] {
  const main = r.terms[0]
  const n = alphabetSize(c)
  const k = c.length
  const hasPos = c.endsWithDigit || c.noStartSymbol
  const out: Applied[] = []

  out.push({
    title: 'Total de caracteres',
    general: 'n = l + u + d + s',
    substituted: alphabetLine(c),
    why: 'Se suman los caracteres de cada tipo.',
  })

  if (c.repetition) {
    out.push(
      hasPos
        ? {
            title: 'Regla del producto',
            general: 'N = n₁ · n₂ ⋯ nₖ',
            substituted: `N = ${productExpr(main.perPosition)}`,
            why: 'Las casillas con condición tienen menos opciones que las demás.',
          }
        : {
            title: 'Con repetición',
            general: 'N = nᵏ',
            substituted: `N = ${n}${sup(k)}`,
            why: `Las ${k} casillas tienen las mismas ${n} opciones.`,
          },
    )
  } else {
    out.push(
      hasPos
        ? {
            title: 'Sin repetición y con posición',
            general: 'N = |S₁| · (|S₂| − 1) · (|S₃| − 2) ⋯',
            substituted: `N = ${termExpr(main, false)}`,
            why: 'Se eligen primero las casillas más restringidas; cada carácter usado resta una opción.',
          }
        : {
            title: 'Sin repetición',
            general: 'P(n, k) = n! / (n − k)!',
            substituted: `P(${n}, ${k}) = ${n}! / (${n} − ${k})! = ${n}! / ${Math.max(0, n - k)}!`,
            why: 'Cada carácter usado deja una opción menos.',
          },
    )
  }

  if (r.required.length > 0) {
    const exprs = r.terms.map((t, i) => {
      const e = termExpr(t, c.repetition)
      const piece = /[×−]/.test(e) ? `(${e})` : e
      return i === 0 ? piece : `${t.sign === 1 ? '+' : '−'} ${piece}`
    })
    const general =
      r.required.length === 1 ? 'N = |U| − |Aᶜ|'
      : r.required.length === 2 ? 'N = |U| − |Aᶜ| − |Bᶜ| + |Aᶜ ∩ Bᶜ|'
      : 'N = Σ (−1)^|T| · |sin T|'
    out.push({
      title: r.required.length === 1 ? 'Complemento ("al menos uno")' : 'Inclusión–exclusión',
      general,
      substituted: `N = ${exprs.join(' ')} = ${fmt(r.total)}`,
      why: 'Se cuentan todas y se restan las que no cumplen.',
    })
  }

  return out
}

export interface SetRow {
  symbol: string
  meaning: string
  formula: string
  value: bigint
}

/** Parte 13: análisis con teoría de conjuntos sobre la política completa de 10 caracteres. */
export function setAnalysis() {
  const base = defaultConfig
  const U = compute(base).total
  const N = compute({ ...base, requireDigit: true }).total
  const M = compute({ ...base, requireUpper: true }).total
  const S = compute({ ...base, requireSymbol: true }).total
  const NM = compute({ ...base, requireDigit: true, requireUpper: true }).total
  const rows: SetRow[] = [
    { symbol: 'U', meaning: 'Todas las contraseñas de 10 caracteres con los 68 caracteres', formula: '|U| = 68¹⁰', value: U },
    { symbol: 'N', meaning: 'Contienen al menos un número', formula: '|N| = 68¹⁰ − 58¹⁰', value: N },
    { symbol: 'M', meaning: 'Contienen al menos una mayúscula', formula: '|M| = 68¹⁰ − 42¹⁰', value: M },
    { symbol: 'S', meaning: 'Contienen al menos un símbolo', formula: '|S| = 68¹⁰ − 62¹⁰', value: S },
    { symbol: 'N ∩ M', meaning: 'Cumplen las dos: tienen un número y una mayúscula', formula: '|N ∩ M| = 68¹⁰ − 58¹⁰ − 42¹⁰ + 32¹⁰', value: NM },
    { symbol: 'N ∪ M', meaning: 'Cumplen al menos una: tienen un número, una mayúscula o ambos', formula: '|N ∪ M| = |N| + |M| − |N ∩ M|', value: N + M - NM },
    { symbol: 'N − M', meaning: 'Tienen un número pero ninguna mayúscula', formula: '|N − M| = |N| − |N ∩ M|', value: N - NM },
  ]
  return rows
}
