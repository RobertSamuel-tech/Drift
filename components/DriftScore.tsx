'use client'

import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'

interface Props {
  score: number
}

const RADIUS = 68
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DriftScore({ score }: Props) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(v) { setCount(Math.round(v)) },
    })
    return () => controls.stop()
  }, [score])

  const stroke      = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const textColor   = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const glowColor   = score >= 80
    ? 'shadow-[0_0_40px_rgba(16,185,129,0.3)]  ring-emerald-500/20'
    : score >= 50
    ? 'shadow-[0_0_40px_rgba(245,158,11,0.3)]  ring-amber-500/20'
    : 'shadow-[0_0_40px_rgba(239,68,68,0.3)]   ring-red-500/20'
  const dashOffset  = CIRCUMFERENCE * (1 - score / 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative h-40 w-40 rounded-full ring-2 ring-offset-4 ring-offset-slate-950 ${glowColor}`}>
        <svg width="160" height="160" className="-rotate-90">
          <circle
            cx="80" cy="80" r={RADIUS}
            fill="none" stroke="currentColor" strokeWidth="8"
            className="text-slate-800"
          />
          <motion.circle
            cx="80" cy="80" r={RADIUS}
            fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums ${textColor}`}>
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
