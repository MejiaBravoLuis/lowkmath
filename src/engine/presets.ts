import type { Config } from './types.ts'

export const defaultConfig: Config = {
  length: 10, lower: 26, upper: 26, digits: 10, symbols: 6, repetition: true,
  requireLower: false, requireUpper: false, requireDigit: false, requireSymbol: false,
  endsWithDigit: false, noStartSymbol: false,
}

const make = (p: Partial<Config>): Config => ({ ...defaultConfig, ...p })

const NUM = { lower: 0, upper: 0, digits: 10, symbols: 0 }
const LOW = { lower: 26, upper: 0, digits: 0, symbols: 0 }
const LU = { lower: 26, upper: 26, digits: 0, symbols: 0 }
const LUN = { lower: 26, upper: 26, digits: 10, symbols: 0 }

export interface Preset {
  id: string
  group: string
  title: string
  config: Config
}

export const presets: Preset[] = [
  { id: 'p1a', group: 'Parte 1', title: '6 dígitos, con repetición', config: make({ ...NUM, length: 6 }) },
  { id: 'p1b', group: 'Parte 1', title: '6 dígitos, sin repetición', config: make({ ...NUM, length: 6, repetition: false }) },
  { id: 'p2a', group: 'Parte 2', title: 'Minúsculas, 8, con repetición', config: make({ ...LOW, length: 8 }) },
  { id: 'p2b', group: 'Parte 2', title: 'Minúsculas, 8, sin repetición', config: make({ ...LOW, length: 8, repetition: false }) },
  { id: 'p3', group: 'Parte 3', title: 'Mayúsculas y minúsculas, 8', config: make({ ...LU, length: 8 }) },
  { id: 'p4', group: 'Parte 4', title: 'Letras y números, 8', config: make({ ...LUN, length: 8 }) },
  { id: 'p5', group: 'Parte 5', title: 'Política completa, 10', config: make({}) },
  { id: 'p6', group: 'Parte 6', title: 'Al menos un número', config: make({ requireDigit: true }) },
  { id: 'p7', group: 'Parte 7', title: 'Al menos una mayúscula', config: make({ requireUpper: true }) },
  { id: 'p8', group: 'Parte 8', title: 'Al menos un número y una mayúscula', config: make({ requireDigit: true, requireUpper: true }) },
  { id: 'p9', group: 'Parte 9', title: 'Termina en número', config: make({ endsWithDigit: true }) },
  { id: 'p10', group: 'Parte 10', title: 'Termina en número, no inicia con símbolo', config: make({ endsWithDigit: true, noStartSymbol: true }) },
  { id: 'p11', group: 'Parte 11', title: 'Igual que la 10, sin repetición', config: make({ endsWithDigit: true, noStartSymbol: true, repetition: false }) },
  {
    id: 'p16', group: 'Parte 16', title: 'Problema integral',
    config: make({ requireUpper: true, requireDigit: true, endsWithDigit: true, noStartSymbol: true }),
  },
]

export interface TableRow {
  id: string
  label: string
  note?: string
  config: Config
}

/** Parte 12: tabla comparativa de políticas. */
export const policyTable: (TableRow & { restrictions: string })[] = [
  { id: 't1', label: 'Numérica', restrictions: 'Ninguna', config: make({ ...NUM, length: 6 }) },
  { id: 't2', label: 'Numérica', restrictions: 'Ninguna', config: make({ ...NUM, length: 6, repetition: false }) },
  { id: 't3', label: 'Minúsculas', restrictions: 'Ninguna', config: make({ ...LOW, length: 8 }) },
  { id: 't4', label: 'Mayúsculas + minúsculas', restrictions: 'Ninguna', config: make({ ...LU, length: 8 }) },
  { id: 't5', label: 'Letras + números', restrictions: 'Ninguna', config: make({ ...LUN, length: 8 }) },
  { id: 't6', label: 'Política completa', restrictions: 'Ninguna', config: make({}) },
  { id: 't7', label: 'Política completa', restrictions: '≥ 1 número', config: make({ requireDigit: true }) },
  { id: 't8', label: 'Política completa', restrictions: '≥ 1 mayúscula', config: make({ requireUpper: true }) },
  { id: 't9', label: 'Política completa', restrictions: '≥ 1 número y ≥ 1 mayúscula', config: make({ requireDigit: true, requireUpper: true }) },
  { id: 't10', label: 'Política completa', restrictions: 'Termina en número', config: make({ endsWithDigit: true }) },
  { id: 't11', label: 'Política completa', restrictions: 'Sin repetición', config: make({ repetition: false }) },
]

/** Parte 14: análisis de longitud. */
export const lengthTable: TableRow[] = [6, 8, 10, 12].map((length) => ({
  id: `len${length}`, label: `${length} caracteres`, config: make({ length }),
}))

/** Parte 15: análisis de restricciones. */
export const scenarioTable: TableRow[] = [
  { id: 'sA', label: 'A', note: 'Sin restricciones', config: make({}) },
  { id: 'sB', label: 'B', note: 'Termina en número', config: make({ endsWithDigit: true }) },
  { id: 'sC', label: 'C', note: 'No comienza con símbolo', config: make({ noStartSymbol: true }) },
  { id: 'sD', label: 'D', note: 'Termina en número y no comienza con símbolo', config: make({ endsWithDigit: true, noStartSymbol: true }) },
  { id: 'sE', label: 'E', note: 'Sin repetición', config: make({ repetition: false }) },
]
