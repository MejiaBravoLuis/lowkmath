import type { Config, CountResult } from '../engine/types.ts'

/** Dibuja la contraseña como casillas y muestra cuántas opciones tiene cada una. */
export default function PasswordSlots({ config, result }: { config: Config; result: CountResult }) {
  const per = result.terms[0].perPosition
  const k = per.length
  const showTimes = k <= 12

  return (
    <div>
      <div className="flex flex-wrap items-end gap-y-3" role="list" aria-label="Opciones por casilla">
        {per.map((o, i) => {
          const tag =
            config.endsWithDigit && i === k - 1 ? 'solo número'
            : config.noStartSymbol && i === 0 ? 'sin símbolo'
            : ''
          return (
            <div key={i} role="listitem" className="flex items-end">
              <div className="flex flex-col items-center gap-1">
                <span className="h-4 text-[10px] font-medium leading-4 text-accent">{tag}</span>
                <span
                  className={`flex h-14 min-w-12 items-center justify-center rounded-xl border-2 px-2 font-mono text-lg font-semibold tabular-nums ${
                    o === 0
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : tag
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-black/15 bg-white'
                  }`}
                >
                  {o}
                </span>
                <span className="text-[10px] text-black/40">{i + 1}ª</span>
              </div>
              {showTimes && i < k - 1 && <span className="mx-1.5 mb-6 text-black/30" aria-hidden="true">×</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-1 text-xs text-black/55">
        {config.repetition
          ? 'Cada número es cuántos caracteres puedes poner en esa casilla.'
          : 'Los números bajan porque cada carácter usado ya no se puede repetir (se muestran en el orden de las casillas).'}
      </p>
    </div>
  )
}
