import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const DIGITS = '0123456789'.split('')

/** Cuentakilómetros: cada cifra es una columna que rueda hasta su valor. Muestra el número exacto. */
export default function Odometer({ value, max = 56 }: { value: string; max?: number }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  const [armed, setArmed] = useState(false)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Posiciones de derecha a izquierda para que cada columna conserve su lugar al cambiar de tamaño.
  const chars = value.split('')
  const n = chars.length
  const seps = Math.floor((n - 1) / 3)
  const em = n * 0.68 + seps * 0.3
  const size = Math.max(14, Math.min(max, ((w || 320) - 4) / em))

  const cols: { key: string; d: number | null }[] = []
  chars.forEach((ch, i) => {
    const fromRight = n - 1 - i
    cols.push({ key: `d${fromRight}`, d: Number(ch) })
    if (fromRight > 0 && fromRight % 3 === 0) cols.push({ key: `s${fromRight}`, d: null })
  })

  return (
    <div ref={wrap} className="w-full">
      <div className="odo-row" style={{ fontSize: size }} role="text" aria-label={Number(value) >= 0 ? BigInt(value).toLocaleString('en-US') : value}>
        {cols.map((c) =>
          c.d === null ? (
            <span key={c.key} className="odo-sep" aria-hidden="true">,</span>
          ) : (
            <span key={c.key} className="odo-col" aria-hidden="true">
              <span className="odo-strip" style={{ transform: `translateY(${armed ? -c.d * 1.3 : 0}em)` }}>
                {DIGITS.map((x) => <span key={x}>{x}</span>)}
              </span>
            </span>
          ),
        )}
      </div>
    </div>
  )
}
