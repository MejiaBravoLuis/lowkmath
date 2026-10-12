import type { CharClass } from './engine/types.ts'

/** Identidad visual de cada tipo de carácter (clases completas para que Tailwind las detecte). */
export const CLASS_META: Record<
  CharClass,
  { label: string; sample: string; card: string; dot: string; text: string; field: keyof FieldMap }
> = {
  lower: { label: 'Minúsculas', sample: 'a b c', card: 'bg-sky-50 border-sky-200', dot: 'bg-sky-500', text: 'text-sky-800', field: 'lower' },
  upper: { label: 'Mayúsculas', sample: 'A B C', card: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500', text: 'text-violet-800', field: 'upper' },
  digit: { label: 'Números', sample: '1 2 3', card: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-800', field: 'digits' },
  symbol: { label: 'Símbolos', sample: '! @ #', card: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500', text: 'text-rose-800', field: 'symbols' },
}

export interface FieldMap {
  lower: number
  upper: number
  digits: number
  symbols: number
}
