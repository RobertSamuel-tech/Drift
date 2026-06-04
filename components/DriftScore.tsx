'use client'

import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { scoreTheme } from '@/components/ui/drift-theme'

interface Props {
  score: number
}

const RADIUS       = 68
const STROKE_WIDTH = 11
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DriftScore({ score }: Props) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const ctrl = animate(0, score, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) { setCount(Math.round(v)) },
    })
    return () => ctrl.stop()
  }, [score])

  const stroke     = scoreTheme.stroke(score)
  const textColor  = scoreTheme.color(score)
  const ringBorder = scoreTheme.border(score)
  const glowShadow = scoreTheme.shadow(score)
  const dashOffset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring container */}
      <div
        className={[
          'relative h-40 w-40 rounded-full',
          'ring-2 ring-offset-4 ring-offset-slate-950',
          ringBorder,
          glowShadow,
          'shadow-2xl shadow-black/50',
        ].join(' ')}
      >
        {/* Inner depth surface */}
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-slate-900/80 to-slate-950/90" />

        <svg width="160" height="160" className="-rotate-90 relative z-10">
          {/* Track ring */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-slate-800/80"
          />
          {/* Subtle secondary glow layer — same color, very faint, wider */}
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={STROKE_WIDTH + 6}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
            opacity={0.08}
          />
          {/* Main progress arc */}
          <motion.circle
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className={`text-5xl font-black tabular-nums tracking-tight ${textColor}`}>
            {count}
          </span>
        </div>
      </div>

      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Drift Score
      </span>
    </div>
  )
}
