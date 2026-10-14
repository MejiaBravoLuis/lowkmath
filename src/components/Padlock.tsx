import { useEffect, useRef, useState } from 'react'

type Mood = 'sad' | 'weak' | 'ok' | 'good' | 'great'

export function moodOf(bits: number, none: boolean): Mood {
  if (none) return 'sad'
  if (bits < 30) return 'weak'
  if (bits < 50) return 'ok'
  if (bits < 70) return 'good'
  return 'great'
}

const COPY: Record<Mood, string> = {
  sad: 'No hay ninguna que cumpla… ¡revisa las reglas!',
  weak: 'Me abren casi sin esfuerzo.',
  ok: 'Aguanto un rato, pero no mucho.',
  good: 'Ya es difícil adivinarme.',
  great: 'Prácticamente imposible de forzar.',
}

const BODY: Record<Mood, string> = {
  sad: '#8d94bd', weak: '#ff5a5f', ok: '#ffb000', good: '#2f6bff', great: '#0fae82',
}

/** Candado-mascota: los ojos siguen al cursor, el candado se cierra y cambia de color según la fuerza. */
export default function Padlock({ bits, none, time }: { bits: number; none: boolean; time: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const mood = moodOf(bits, none)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height * 0.6)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 160)
      setLook({ x: (dx / d) * 3.2 * k, y: (dy / d) * 2.6 * k })
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const open = mood === 'weak' || mood === 'sad'
  const mouth =
    mood === 'sad' ? 'M38 84 Q50 74 62 84'
    : mood === 'weak' ? 'M40 82 Q50 77 60 82'
    : mood === 'ok' ? 'M40 80 L60 80'
    : mood === 'good' ? 'M40 78 Q50 86 60 78'
    : 'M36 76 Q50 92 64 76'

  return (
    <div className="flex items-center gap-3">
      <svg ref={ref} viewBox="0 0 100 120" className="w-24 shrink-0 overflow-visible" role="img" aria-label={`Candado ${COPY[mood]}`}>
        <g style={{ transformOrigin: '72px 56px', transform: open ? 'rotate(24deg) translateY(-4px)' : 'rotate(0)', transition: 'transform .5s cubic-bezier(.3,1.7,.5,1)' }}>
          <path d="M28 56 V38 a22 22 0 0 1 44 0 V56" fill="none" stroke="#8d94bd" strokeWidth="9" strokeLinecap="round" />
          <path d="M28 56 V38 a22 22 0 0 1 44 0" fill="none" stroke="#c7cde6" strokeWidth="3" strokeLinecap="round" transform="translate(-1 -1)" />
        </g>
        <rect x="10" y="52" width="80" height="62" rx="18" fill="#15163a" opacity=".18" transform="translate(0 5)" />
        <rect x="10" y="52" width="80" height="62" rx="18" fill={BODY[mood]} style={{ transition: 'fill .5s' }} />
        <rect x="10" y="52" width="80" height="26" rx="14" fill="#fff" opacity=".22" />
        <g>
          <circle cx="36" cy="68" r="8.5" fill="#fff" /><circle cx="64" cy="68" r="8.5" fill="#fff" />
          <circle cx={36 + look.x} cy={68 + look.y} r="4.2" fill="#15163a" /><circle cx={64 + look.x} cy={68 + look.y} r="4.2" fill="#15163a" />
          <circle cx={37.4 + look.x} cy={66.6 + look.y} r="1.3" fill="#fff" /><circle cx={65.4 + look.x} cy={66.6 + look.y} r="1.3" fill="#fff" />
        </g>
        <path d={mouth} fill="none" stroke="#15163a" strokeWidth="3.4" strokeLinecap="round" style={{ transition: 'd .4s' }} />
        {mood === 'great' && (<><circle cx="22" cy="82" r="4" fill="#fff" opacity=".35" /><circle cx="78" cy="82" r="4" fill="#fff" opacity=".35" /></>)}
      </svg>
      <div className="relative rounded-2xl rounded-bl-sm bg-paper px-3.5 py-2.5 text-sm shadow-[0_3px_0_var(--color-steel-deep)]">
        <p className="font-semibold leading-snug">{COPY[mood]}</p>
        {!none && <p className="mt-0.5 text-xs text-ink-soft">Un ataque a 10⁹ intentos por segundo tardaría {time}.</p>}
      </div>
    </div>
  )
}
