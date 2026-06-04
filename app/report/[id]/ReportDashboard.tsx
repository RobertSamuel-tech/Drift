'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Ghost, AlertTriangle, Zap, ArrowLeft, ExternalLink, Info,
  ArrowRight, TrendingUp, Wrench, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import ProductRealityMap from '@/components/ProductRealityMap'
import type { Project, DriftZone } from '@/lib/database.types'
import type { WasteMetrics } from '@/lib/cost-analysis'
import type { RealityMap } from '@/lib/reality-map'
import type { FounderAlignment } from '@/lib/founder-alignment'
import type { RoadmapReallocationResult, RoadmapAction } from '@/lib/roadmap-reallocation'
import type { FeatureLifecycleItem, LifecycleStage } from '@/lib/feature-lifecycle'
import type { FallbackCard } from '@/lib/fallback-cards'
import { formatCost } from '@/lib/cost-analysis'
import ExportButton from './ExportButton'

// ─── types ────────────────────────────────────────────────────────────────────

export interface ReportDashboardProps {
  project:        Project
  zones:          DriftZone[]
  waste:          WasteMetrics
  realityData:    RealityMap
  alignmentData:  FounderAlignment
  roadmapData:    RoadmapReallocationResult
  lifecycleItems: FeatureLifecycleItem[]
  cards:          FallbackCard[]
  topRisks:       DriftZone[]
  ghosts:         DriftZone[]
  summary:        string
  analyzed:       string
  projectId:      string
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const DRIFT_TYPE_COLOR: Record<string, string> = {
  ghost:         'text-slate-400  border-slate-600/60 bg-slate-800/30',
  overbuilt:     'text-red-400    border-red-500/30   bg-red-500/5',
  underbuilt:    'text-amber-400  border-amber-500/30 bg-amber-500/5',
  misunderstood: 'text-violet-400 border-violet-500/30 bg-violet-500/5',
}
const PRIORITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500/15   text-red-400   ring-1 ring-red-500/25',
  high:     'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
  medium:   'bg-blue-500/15  text-blue-400  ring-1 ring-blue-500/25',
  low:      'bg-slate-700/50 text-slate-400 ring-1 ring-slate-600/40',
}
const RISK_LABEL: Record<string, string> = {
  ghost: 'GHOST', overbuilt: 'OVERBUILT', underbuilt: 'UNDERBUILT', misunderstood: 'MISMATCH',
}

function scoreColor(s: number) { return s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400' }
function scoreLabel(s: number) { return s >= 80 ? 'HEALTHY' : s >= 50 ? 'DRIFTING' : 'CRITICAL' }

function whyItMatters(z: DriftZone) {
  switch (z.drift_type) {
    case 'ghost':         return `Built as ${z.intended_priority} priority — completely unused.`
    case 'overbuilt':     return `${z.actual_usage_score}/100 usage despite high investment.`
    case 'underbuilt':    return `${z.actual_usage_score}/100 usage but treated as low priority.`
    case 'misunderstood': return `${z.actual_usage_score}/100 usage, not as designed.`
    default:              return `Usage at ${z.actual_usage_score}/100 diverges from spec.`
  }
}

// ─── hero metric block ────────────────────────────────────────────────────────

function HeroStat({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 border-l border-slate-700/60 px-5 first:border-0">
      <span className={`font-mono text-3xl font-black tabular-nums leading-none ${color}`}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  )
}

// ─── section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/60 px-5 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</span>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ReportDashboard({
  project: p,
  zones,
  waste,
  realityData,
  alignmentData,
  roadmapData,
  lifecycleItems,
  cards,
  topRisks,
  ghosts,
  summary,
  analyzed,
  projectId,
}: ReportDashboardProps) {

  // Lifecycle tab state
  const [activeTab, setActiveTab] = useState<LifecycleStage>('Ghost')
  const [showAllLifecycle, setShowAllLifecycle] = useState(false)

  // Expandable lists
  const [showAllGhosts, setShowAllGhosts] = useState(false)
  const [showFullRoadmap, setShowFullRoadmap] = useState(false)

  const costTheme = waste.estimatedCost >= 15000
    ? { text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5' }
    : waste.estimatedCost >= 5000
    ? { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5' }
    : { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' }

  // Lifecycle by stage
  const STAGE_ORDER: LifecycleStage[] = ['Ghost', 'Ignored', 'Partial Adoption', 'Core Product']
  const byStage = STAGE_ORDER.reduce<Record<LifecycleStage, FeatureLifecycleItem[]>>((acc, s) => {
    acc[s] = lifecycleItems.filter(i => i.lifecycleStage === s)
    return acc
  }, { Ghost: [], Ignored: [], 'Partial Adoption': [], 'Core Product': [] })

  const tabItems    = byStage[activeTab]
  const visibleTab  = showAllLifecycle ? tabItems : tabItems.slice(0, 4)

  // Roadmap: current direction (sorted by intended_priority)
  const PRIO: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const currentDir = [...zones].sort((a, b) => (PRIO[a.intended_priority] ?? 3) - (PRIO[b.intended_priority] ?? 3))
  const recommended: { action: RoadmapAction; type: 'invest' | 'improve' | 'remove' }[] = [
    ...roadmapData.invest.map (a => ({ action: a, type: 'invest'  as const })),
    ...roadmapData.improve.map(a => ({ action: a, type: 'improve' as const })),
    ...roadmapData.remove.map (a => ({ action: a, type: 'remove'  as const })),
  ]
  const visCurrentDir = showFullRoadmap ? currentDir  : currentDir.slice(0, 5)
  const visRecommended = showFullRoadmap ? recommended : recommended.slice(0, 5)

  const ACTION_STYLE = {
    invest:  { icon: TrendingUp, color: 'text-emerald-400', label: 'INVEST'  },
    improve: { icon: Wrench,     color: 'text-amber-400',   label: 'IMPROVE' },
    remove:  { icon: Trash2,     color: 'text-red-400',     label: 'REMOVE'  },
  }

  // Ghost list
  const visGhosts = showAllGhosts ? ghosts : ghosts.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex h-11 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300">
            <ArrowLeft className="h-3 w-3" /> Archive
          </Link>
          <span className="text-slate-700">|</span>
          <span className="font-mono text-[10px] font-bold text-[#FF8A1F] tracking-widest">DRIFT</span>
          <span className="font-mono text-[10px] text-slate-600">/ Founder Report</span>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            projectName={p.name}
            score={p.drift_score}
            analyzedAt={analyzed}
            zones={zones}
            cards={cards}
            summary={summary}
          />
          <Link href={`/dashboard/${projectId}`}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-emerald-400">
            Ghost Mode <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* ── SECTION 1: Hero — single row, ≤220px ────────────────────────── */}
      <section className="border-b border-slate-700/60 bg-slate-900 px-8 py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Project name + meta */}
          <div className="min-w-0 shrink-0">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
              FOUNDER REPORT · {new Date(analyzed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </p>
            <h1 className="mt-0.5 font-mono text-2xl font-bold tracking-wide text-white leading-tight truncate max-w-[280px]">
              {p.name}
            </h1>
            <p className={`mt-1 font-mono text-xs font-semibold uppercase tracking-widest ${scoreColor(p.drift_score)}`}>
              {scoreLabel(p.drift_score)}
            </p>
          </div>

          {/* Metric strip */}
          <div className="flex flex-1 items-center justify-center gap-0">
            <HeroStat label="DRIFT SCORE"     value={String(p.drift_score)}            color={scoreColor(p.drift_score)} />
            <HeroStat label="FOUNDER REGRET"  value={`${alignmentData.regretIndex}%`}  color={alignmentData.regretIndex > 50 ? 'text-red-400' : 'text-amber-400'} />
            <HeroStat label="ALIGNMENT INDEX" value={`${alignmentData.alignmentIndex}%`} color={alignmentData.alignmentIndex >= 50 ? 'text-emerald-400' : 'text-red-400'} />
            <HeroStat label="EST. WASTE"      value={waste.estimatedCost > 0 ? formatCost(waste.estimatedCost) : '$0'} color={waste.estimatedCost > 0 ? 'text-red-400' : 'text-slate-400'} />
            <HeroStat label="GHOST FEATURES"  value={String(ghosts.length)}            color={ghosts.length > 0 ? 'text-red-400' : 'text-slate-400'} />
            <HeroStat label="SPRINTS LOST"    value={String(waste.wastedSprints)}      color={waste.wastedSprints > 0 ? 'text-amber-400' : 'text-slate-400'} />
          </div>

          {/* Severity badge */}
          <div className="shrink-0 text-right">
            <p className={`font-mono text-[10px] uppercase tracking-widest ${alignmentData.regretIndex > 75 ? 'text-red-400' : alignmentData.regretIndex > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {alignmentData.severity}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-[200px] leading-snug">{alignmentData.summary}</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Founder Summary — directly under hero ────────────── */}
      <section className="border-b border-slate-700/60 bg-slate-900/40 px-8 py-4">
        <p className="text-sm font-semibold leading-relaxed text-violet-200">
          &ldquo;{summary}&rdquo;
        </p>
      </section>

      <div className="mx-auto max-w-screen-2xl space-y-3 px-8 py-4">

        {/* ── SECTION 2: Reality Map (65%) + Right Column (35%) ─────────── */}
        <div className="grid gap-3 lg:grid-cols-[65fr_35fr]">

          {/* Left — Product Reality Map */}
          <div className="border border-slate-700/60 bg-slate-900 min-h-0">
            <SectionHeader label="Product Reality Map" />
            <div className="p-5">
              <ProductRealityMap data={realityData} />
            </div>
          </div>

          {/* Right — Intel column */}
          <div className="flex flex-col gap-3">

            {/* Top Risks */}
            <div className="border border-slate-700/60 bg-slate-900">
              <SectionHeader label="Top Risks" />
              <div className="divide-y divide-slate-800/60">
                {topRisks.length === 0 ? (
                  <p className="px-5 py-3 text-xs text-slate-500">No significant risks detected.</p>
                ) : topRisks.map(zone => (
                  <div key={zone.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`mt-0.5 shrink-0 border-l-2 pl-2 ${DRIFT_TYPE_COLOR[zone.drift_type] ?? ''}`}>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{RISK_LABEL[zone.drift_type]}</p>
                      <p className="text-sm font-semibold text-white">{zone.feature_name}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{whyItMatters(zone)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghost Features */}
            <div className="border border-slate-700/60 bg-slate-900">
              <SectionHeader label={`Ghost Features (${ghosts.length})`} />
              {ghosts.length === 0 ? (
                <div className="px-5 py-3 text-xs text-emerald-400">No ghost features — all builds are used.</div>
              ) : (
                <div>
                  <div className="divide-y divide-slate-800/60">
                    {visGhosts.map(zone => (
                      <div key={zone.id} className="flex items-center gap-3 px-5 py-2.5">
                        <Ghost className="h-3.5 w-3.5 shrink-0 text-red-500/60" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{zone.feature_name}</p>
                          <p className="text-[10px] text-slate-500">
                            {zone.intended_priority} priority · <span className="font-mono text-red-400">{zone.actual_usage_score}/100</span>
                          </p>
                        </div>
                        <AlertTriangle className="h-3 w-3 shrink-0 text-red-500/40" />
                      </div>
                    ))}
                  </div>
                  {ghosts.length > 3 && (
                    <button
                      onClick={() => setShowAllGhosts(!showAllGhosts)}
                      className="flex w-full items-center justify-center gap-1.5 border-t border-slate-800/60 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400"
                    >
                      {showAllGhosts ? <><ChevronUp className="h-3 w-3" /> Collapse</> : <><ChevronDown className="h-3 w-3" /> Show all {ghosts.length}</>}
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── SECTION 3: Roadmap Reallocation — horizontal 2-col ───────── */}
        <div className="border border-slate-700/60 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Roadmap Reallocation</span>
            <span className="text-xs text-slate-600">{roadmapData.summary}</span>
          </div>

          <div className="grid gap-px bg-slate-700/20 lg:grid-cols-2">
            {/* Current direction */}
            <div className="bg-slate-900 p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Current Direction</p>
              <div className="space-y-1.5">
                {visCurrentDir.map((z, i) => (
                  <div key={z.id} className="flex items-center gap-2.5">
                    <span className="font-mono text-[9px] text-slate-700">#{i + 1}</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                    <span className="flex-1 truncate text-sm text-slate-300">{z.feature_name}</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">{z.intended_priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended direction */}
            <div className="bg-slate-900 p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Recommended Direction</p>
              <div className="space-y-1.5">
                {visRecommended.map(({ action, type }, i) => {
                  const cfg = ACTION_STYLE[type]
                  const Icon = cfg.icon
                  return (
                    <div key={action.featureName} className="flex items-center gap-2.5">
                      <span className="font-mono text-[9px] text-slate-700">#{i + 1}</span>
                      <Icon className={`h-3 w-3 shrink-0 ${cfg.color}`} />
                      <span className={`flex-1 truncate text-sm ${cfg.color}`}>{action.featureName}</span>
                      <span className={`font-mono text-[9px] uppercase tracking-wider ${cfg.color} opacity-60`}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Toggle */}
          {(currentDir.length > 5 || recommended.length > 5) && (
            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-slate-800/60 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400"
            >
              {showFullRoadmap
                ? <><ChevronUp className="h-3 w-3" /> Collapse roadmap</>
                : <><ChevronDown className="h-3 w-3" /> View full roadmap ({Math.max(currentDir.length, recommended.length)} items)</>}
            </button>
          )}
        </div>

        {/* ── SECTION 4: Feature Lifecycle — tabbed ────────────────────── */}
        <div className="border border-slate-700/60 bg-slate-900">
          {/* Tab header */}
          <div className="flex items-center border-b border-slate-800/60">
            <span className="border-r border-slate-800/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Feature Lifecycle
            </span>
            <div className="flex">
              {STAGE_ORDER.map(stage => (
                <button
                  key={stage}
                  onClick={() => { setActiveTab(stage); setShowAllLifecycle(false) }}
                  className={[
                    'border-r border-slate-800/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors',
                    activeTab === stage
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:text-slate-400',
                  ].join(' ')}
                >
                  {stage} ({byStage[stage].length})
                </button>
              ))}
            </div>
          </div>

          {tabItems.length === 0 ? (
            <p className="px-5 py-4 text-xs text-slate-500">No features in this stage.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-px bg-slate-700/10 md:grid-cols-4">
                {visibleTab.map(item => {
                  const stageDot =
                    item.lifecycleStage === 'Ghost'            ? 'bg-red-500'     :
                    item.lifecycleStage === 'Ignored'          ? 'bg-slate-500'   :
                    item.lifecycleStage === 'Partial Adoption' ? 'bg-amber-500'   : 'bg-emerald-500'
                  const stageText =
                    item.lifecycleStage === 'Ghost'            ? 'text-red-400'   :
                    item.lifecycleStage === 'Ignored'          ? 'text-slate-400' :
                    item.lifecycleStage === 'Partial Adoption' ? 'text-amber-400' : 'text-emerald-400'
                  return (
                    <div key={item.featureName} className="bg-slate-900 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stageDot}`} />
                        <p className={`font-mono text-[9px] uppercase tracking-widest ${stageText}`}>
                          {item.lifecycleStage}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{item.featureName}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-slate-600 uppercase">{item.priority} priority</span>
                        <span className="font-mono text-xs tabular-nums text-slate-400">{item.usageScore}/100</span>
                      </div>
                      <div className="mt-2 h-px w-full overflow-hidden bg-slate-800">
                        <div
                          className={`h-full ${stageDot}`}
                          style={{ width: `${item.usageScore}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {tabItems.length > 4 && (
                <button
                  onClick={() => setShowAllLifecycle(!showAllLifecycle)}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-slate-800/60 py-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400"
                >
                  {showAllLifecycle
                    ? <><ChevronUp className="h-3 w-3" /> Collapse</>
                    : <><ChevronDown className="h-3 w-3" /> Show all {tabItems.length} features</>}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── SECTION 5: Engineering Impact + AI Recommendations ───────── */}
        <div className="grid gap-3 lg:grid-cols-2">

          {/* Engineering Impact */}
          <div className={`border bg-slate-900 ${costTheme.border}`}>
            <SectionHeader label="Engineering Impact" />
            {waste.wastedFeatures === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-400">No engineering waste detected — all built features are being used.</p>
            ) : (
              <div className="p-5">
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className={`font-mono text-3xl font-black tabular-nums leading-none ${costTheme.text}`}>
                      {formatCost(waste.estimatedCost)}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">Estimated Waste</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-mono text-3xl font-black tabular-nums leading-none ${costTheme.text}`}>
                      {waste.wastedFeatures}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">Ghost Features</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-mono text-3xl font-black tabular-nums leading-none ${costTheme.text}`}>
                      {waste.wastedSprints}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">Sprints Lost</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 border border-slate-700/40 bg-slate-950/40 p-3">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />
                  <p className="text-xs text-slate-500">
                    5 engineers × 10 days/sprint × $800/day. Ghost and overbuilt features only.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="border border-slate-700/60 bg-slate-900">
            <SectionHeader label="AI Recommendations" />
            {cards.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No recommendations — product is well-aligned.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {cards.map((card, i) => (
                  <div key={i} className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-violet-500/30 bg-violet-500/10">
                          <Zap className="h-3 w-3 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">{card.title}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${PRIORITY_COLOR[card.priority]}`}>
                        {card.priority}
                      </span>
                    </div>
                    <p className="mb-2 text-xs leading-relaxed text-slate-400">{card.user_story}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="border border-slate-700/40 bg-slate-950/40 p-2">
                        <p className="mb-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-600">Copy</p>
                        <p className="text-xs text-slate-300">{card.copy_rewrite}</p>
                      </div>
                      <div className="border border-slate-700/40 bg-slate-950/40 p-2">
                        <p className="mb-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-600">Mockup</p>
                        <p className="text-xs text-slate-300">{card.mockup_suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 pb-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
            Generated by DRIFT · Powered by Novus.ai
          </p>
        </div>

      </div>
    </div>
  )
}
