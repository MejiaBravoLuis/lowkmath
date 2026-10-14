import type { CharClass } from './engine/types.ts'

/** Identidad de cada tipo de carácter: nombre, qué campo de la política controla y su tecla de muestra. */
export const CLASS_META: Record<CharClass, { label: string; one: string; field: 'lower' | 'upper' | 'digits' | 'symbols'; plural: string }> = {
  lower: { label: 'Minúsculas', one: 'una minúscula', plural: 'minúsculas', field: 'lower' },
  upper: { label: 'Mayúsculas', one: 'una mayúscula', plural: 'mayúsculas', field: 'upper' },
  digit: { label: 'Números', one: 'un número', plural: 'números', field: 'digits' },
  symbol: { label: 'Símbolos', one: 'un símbolo', plural: 'símbolos', field: 'symbols' },
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
