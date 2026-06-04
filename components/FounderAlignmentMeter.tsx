'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { FounderAlignment } from '@/lib/founder-alignment'
import { formatCost } from '@/lib/cost-analysis'
import { metric, spring } from '@/components/ui/drift-theme'

// ─── colour palette keyed on regretIndex ─────────────────────────────────────
function severityColors(regret: number) {
  if (regret <= 25) return { stroke: '#22c55e', text: 'text-emerald-400', ring: 'border-emerald-500/20', bg: 'bg-emerald-500/5'  }
  if (regret <= 50) return { stroke: '#f59e0b', text: 'text-amber-400',   ring: 'border-amber-500/20',  bg: 'bg-amber-500/5'   }
  if (regret <= 75) return { stroke: '#f97316', text: 'text-orange-400',  ring: 'border-orange-500/20', bg: 'bg-orange-500/5'  }
  return                   { stroke: '#ef4444', text: 'text-red-400',     ring: 'border-red-500/20',    bg: 'bg-red-500/5'     }
}

// ─── SVG arc helpers ──────────────────────────────────────────────────────────
const R   = 96   // radius of the arc
const CX  = 130  // viewBox center x (wider to fit labels)
const CY  = 120  // viewBox center y
const GAP = 30   // degrees clipped at the bottom

function polarToXY(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
}

function arcPath(startDeg: number, endDeg: number) {
  const s   = polarToXY(startDeg)
  const e   = polarToXY(endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`
}

// The arc runs from GAP/2 degrees offset at bottom-left to bottom-right
const ARC_START = 90 + GAP / 2          // ≈ 105°
const ARC_END   = 90 - GAP / 2 + 360   // ≈ 435° (= 360+75)  → full sweep = 330°
const ARC_SWEEP = 360 - GAP             // 330°

// Zones: Aligned 0-25, Concern 26-50, High Risk 51-75, Critical 76-100
const ZONE_COLORS = ['#22c55e', '#f59e0b', '#f97316', '#ef4444']
const ZONE_LABELS = ['Aligned', 'Concern', 'High Risk', 'Critical']
const ZONE_STARTS = [0, 25, 50, 75]

function zoneArcPath(pctStart: number, pctEnd: number) {
  const s = ARC_START + (pctStart / 100) * ARC_SWEEP
  const e = ARC_START + (pctEnd   / 100) * ARC_SWEEP
  return arcPath(s, e)
}

function labelPos(pctMid: number, r: number) {
  const deg = ARC_START + (pctMid / 100) * ARC_SWEEP
  return polarToXY(deg)       // caller passes custom r via override
}
function labelPosR(pctMid: number, r: number) {
  const deg = ARC_START + (pctMid / 100) * ARC_SWEEP
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// ─── Animated arc ─────────────────────────────────────────────────────────────
function AnimatedArc({ regret, stroke }: { regret: number; stroke: string }) {
  const progress = useMotionValue(0)
  const circumference = (ARC_SWEEP / 360) * 2 * Math.PI * R

  useEffect(() => {
    const ctrl = animate(progress, regret / 100, { duration: 1.8, ease: 'easeOut' })
    return () => ctrl.stop()
  }, [regret])   // eslint-disable-line react-hooks/exhaustive-deps

  const dashOffset = useTransform(progress, v =>
    circumference - v * circumference
  )

  const arcD = arcPath(ARC_START, ARC_END)

  return (
    <motion.path
      d={arcD}
      fill="none"
      stroke={stroke}
      strokeWidth={13}
      strokeLinecap="round"
      strokeDasharray={circumference}
      style={{ strokeDashoffset: dashOffset } as React.CSSProperties}
    />
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  data:              FounderAlignment
  ghostFeatures:     number
  overbuiltFeatures: number
  concentrationScore: number
  estimatedWaste:    number
}

export default function FounderAlignmentMeter({
  data,
  ghostFeatures,
  overbuiltFeatures,
  concentrationScore,
  estimatedWaste,
}: Props) {
  const colors = severityColors(data.regretIndex)

  return (
    <div>
      {/* ── Main meter + summary card ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">

        {/* SVG meter — command-center panel */}
        <div className="shrink-0 border border-slate-700/60 bg-slate-900 shadow-lg shadow-black/40">
          <svg
            viewBox="0 0 260 210"
            width={260}
            height={210}
            aria-label={`Founder Alignment Meter. Regret Index: ${data.regretIndex}%. Alignment Index: ${data.alignmentIndex}%. Severity: ${data.severity}.`}
            role="img"
          >
            {/* Track (background ring) */}
            <path
              d={arcPath(ARC_START, ARC_END)}
              fill="none"
              stroke="#1e293b"
              strokeWidth={13}
              strokeLinecap="round"
            />

            {/* Coloured zone segments */}
            {ZONE_STARTS.map((start, i) => {
              const end = i < 3 ? ZONE_STARTS[i + 1] : 100
              return (
                <path
                  key={ZONE_LABELS[i]}
                  d={zoneArcPath(start, end)}
                  fill="none"
                  stroke={ZONE_COLORS[i]}
                  strokeWidth={4}
                  strokeLinecap="butt"
                  opacity={0.22}
                />
              )
            })}

            {/* Animated filled arc (regret) */}
            <AnimatedArc regret={data.regretIndex} stroke={colors.stroke} />

            {/* Zone labels */}
            {ZONE_STARTS.map((start, i) => {
              const end   = i < 3 ? ZONE_STARTS[i + 1] : 100
              const mid   = (start + end) / 2
              const pos   = labelPosR(mid, R + 22)
              return (
                <text
                  key={ZONE_LABELS[i]}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7.5}
                  fontWeight={600}
                  fill={ZONE_COLORS[i]}
                  opacity={0.7}
                  style={{ letterSpacing: '0.05em' }}
                >
                  {ZONE_LABELS[i].toUpperCase()}
                </text>
              )
            })}

            {/* Center: Regret number */}
            <text
              x={CX}
              y={CY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={38}
              fontWeight={900}
              fill="white"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {data.regretIndex}%
            </text>

            {/* Center: label */}
            <text
              x={CX}
              y={CY + 26}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontWeight={700}
              fill="#64748b"
              style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              FOUNDER REGRET
            </text>

            {/* Center: alignment index sub-label */}
            <text
              x={CX}
              y={CY + 42}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8.5}
              fill="#475569"
            >
              Alignment Index: {data.alignmentIndex}%
            </text>
          </svg>

          {/* Severity readout */}
          <div className="border-t border-slate-800/60 px-4 py-2 text-center">
            <span className={`font-mono text-[9px] uppercase tracking-widest ${colors.text}`}>
              {data.severity}
            </span>
          </div>
        </div>

        {/* Summary panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, ...spring.panel }}
          className={`flex-1 border border-slate-700/60 bg-slate-900 shadow-lg shadow-black/30`}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/60 px-4 py-2">
            <span className={`h-1.5 w-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Founder Alignment Index
            </span>
          </div>

          <div className="p-5">
            <p className={`mb-3 font-mono text-5xl font-black tabular-nums leading-none ${colors.text}`}>
              {data.alignmentIndex}%
            </p>
            <p className="mb-3 text-sm font-semibold leading-relaxed text-slate-200">
              {data.summary}
            </p>
            {(ghostFeatures > 0 || overbuiltFeatures > 0) && (
              <p className="mb-3 text-xs leading-relaxed text-slate-500">
                {ghostFeatures > 0 && `${ghostFeatures} ghost feature${ghostFeatures !== 1 ? 's' : ''} consumed roadmap capacity with no measurable return. `}
                {overbuiltFeatures > 0 && `${overbuiltFeatures} overbuilt feature${overbuiltFeatures !== 1 ? 's' : ''} received investment above their adoption level.`}
              </p>
            )}
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
              Source: Novus-backed analysis
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Metrics strip ────────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-px border border-slate-700/60 bg-slate-700/20 sm:grid-cols-4">
        {([
          { label: 'Ghost Features',        value: String(ghostFeatures),                    color: ghostFeatures > 0      ? 'text-red-400'    : 'text-slate-400' },
          { label: 'Overbuilt Features',    value: String(overbuiltFeatures),                color: overbuiltFeatures > 0  ? 'text-orange-400' : 'text-slate-400' },
          { label: 'Reality Concentration', value: `${concentrationScore}%`,                 color: concentrationScore > 70 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Estimated Waste',       value: estimatedWaste > 0 ? formatCost(estimatedWaste) : '$0', color: estimatedWaste > 0 ? 'text-red-400' : 'text-slate-400' },
        ] as const).map(m => (
          <div key={m.label} className="bg-slate-900 px-4 py-3">
            <p className={`font-mono text-xl font-bold tabular-nums leading-none ${m.color}`}>{m.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
