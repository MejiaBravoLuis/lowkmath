export type CharClass = 'lower' | 'upper' | 'digit' | 'symbol'

/** Política de contraseñas (Parte 18 del proyecto). */
export interface Config {
  length: number
  lower: number
  upper: number
  digits: number
  symbols: number
  repetition: boolean
  // Restricciones de contenido: "al menos uno de..."
  requireLower: boolean
  requireUpper: boolean
  requireDigit: boolean
  requireSymbol: boolean
  // Restricciones de posición
  endsWithDigit: boolean
  noStartSymbol: boolean
}

/** Un sumando de la inclusión–exclusión: N(sin las clases de `excluded`). */
export interface Term {
  excluded: CharClass[]
  sign: 1 | -1
  /** Tamaño del conjunto permitido en cada posición (antes de aplicar no-repetición). */
  setSizes: number[]
  /** Opciones efectivas por posición, en orden de posición. */
  perPosition: number[]
  /** Opciones en el orden en que se eligen (más restringida primero). */
  factors: number[]
  value: bigint
}

export interface CountResult {
  total: bigint
  /** terms[0] siempre es el universo (nada excluido). */
  terms: Term[]
  required: CharClass[]
}
