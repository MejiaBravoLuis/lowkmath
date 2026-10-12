import type { ReactNode } from 'react'
import SpotlightCard from './reactbits/SpotlightCard.tsx'

interface Props {
  step?: number
  title: string
  hint?: string
  children: ReactNode
}

/** Tarjeta con efecto de luz (React Bits · SpotlightCard) y encabezado numerado. */
export default function Panel({ step, title, hint, children }: Props) {
  return (
    <SpotlightCard
      theme="light"
      spotlightColor="#0f766e"
      intensity={0.7}
      spotlightSize={320}
      className="rounded-2xl! p-5! sm:p-6!"
    >
      <header className="mb-4 flex items-start gap-3">
        {step !== undefined && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-black/60">{hint}</p>}
        </div>
      </header>
      {children}
    </SpotlightCard>
  )
}
