import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Ghost, Zap, ArrowLeft, ExternalLink, Info } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { getFallbackCard } from '@/lib/fallback-cards'
import { calculateWasteMetrics, getCostTheme, formatCost } from '@/lib/cost-analysis'
import { buildFeatureLifecycle } from '@/lib/feature-lifecycle'
import { buildRealityMap } from '@/lib/reality-map'
import { calculateFounderAlignment } from '@/lib/founder-alignment'
import { generateRoadmapReallocation } from '@/lib/roadmap-reallocation'
import FeatureTimeline from '@/components/FeatureTimeline'
import ProductRealityMap from '@/components/ProductRealityMap'
import FounderAlignmentMeter from '@/components/FounderAlignmentMeter'
import RoadmapReallocation from '@/components/RoadmapReallocation'
import type { Project, DriftZone } from '@/lib/database.types'
import type { FallbackCard } from '@/lib/fallback-cards'
import ExportButton from './ExportButton'

const RISK_ORDER: Record<string, number> = { ghost: 0, overbuilt: 1, misunderstood: 2, underbuilt: 3 }

const DRIFT_COLOR: Record<string, string> = {
  ghost:         'border-slate-600/60 bg-slate-800/30  text-slate-400',
  overbuilt:     'border-red-500/30   bg-red-500/5     text-red-400',
  underbuilt:    'border-amber-500/30 bg-amber-500/5   text-amber-400',
  misunderstood: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
}
const PRIORITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500/15    text-red-400    ring-1 ring-red-500/25',
  high:     'bg-amber-500/15  text-amber-400  ring-1 ring-amber-500/25',
  medium:   'bg-blue-500/15   text-blue-400   ring-1 ring-blue-500/25',
  low:      'bg-slate-700/50  text-slate-400  ring-1 ring-slate-600/40',
}

function whyItMatters(zone: DriftZone): string {
  switch (zone.drift_type) {
    case 'ghost':         return `Built as a ${zone.intended_priority} priority but completely unused. Every sprint spent here was wasted.`
    case 'overbuilt':     return `${zone.actual_usage_score}/100 usage despite high investment. Users don't value this the way you do.`
    case 'underbuilt':    return `${zone.actual_usage_score}/100 usage but treated as low priority. You're leaving growth on the table.`
    case 'misunderstood': return `${zone.actual_usage_score}/100 usage, but users hacked around your design intent.`
    default:              return `Usage at ${zone.actual_usage_score}/100 diverges from spec intent.`
  }
}

function founderSummary(zones: DriftZone[]): string {
  const worst  = zones.find(z => z.drift_type === 'ghost' || z.drift_type === 'overbuilt')
  const winner = zones.find(z => z.drift_type === 'underbuilt')
  if (worst && winner)
    return `Your team spent effort building "${worst.feature_name}", but users spend time on "${winner.feature_name}". The gap between what you built and what users do is your drift.`
  if (worst)
    return `Your team spent effort building "${worst.feature_name}", but users barely touch it. Realign your roadmap to match actual behavior.`
  if (winner)
    return `Users spend disproportionate time on "${winner.feature_name}", which your spec treats as low priority. This is your next big feature.`
  return `Your product shows measurable drift from the original spec. Use the zones below to prioritize your next sprint.`
}

function scoreLabel(s: number) { return s >= 80 ? 'Healthy' : s >= 50 ? 'Drifting' : 'Critical Drift' }
function scoreColor(s: number) { return s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400' }
function scoreBorder(s: number) { return s >= 80 ? 'border-emerald-500/20' : s >= 50 ? 'border-amber-500/20' : 'border-red-500/20' }

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: project } = await supabase
    .from('projects').select('*').eq('id', params.id).single()
  if (!project) notFound()

  const { data: rawZones } = await supabase
    .from('drift_zones').select('*').eq('project_id', params.id)
    .order('position_y').order('position_x')

  const zones: DriftZone[] = (rawZones ?? []).map(z => ({
    ...z,
    drift_type:        z.drift_type        as DriftZone['drift_type'],
    intended_priority: z.intended_priority as DriftZone['intended_priority'],
  }))

  const p              = project as Project
  const waste          = calculateWasteMetrics(zones)
  const costTheme      = getCostTheme(waste.estimatedCost)
  const lifecycleItems = buildFeatureLifecycle(p, zones)
  const realityData    = buildRealityMap(zones)
  const alignmentData  = calculateFounderAlignment({
    driftScore:         p.drift_score,
    ghostFeatures:      zones.filter(z => z.drift_type === 'ghost').length,
    overbuiltFeatures:  zones.filter(z => z.drift_type === 'overbuilt').length,
    concentrationScore: realityData.concentrationScore,
  })
  const topRisks  = [...zones].filter(z => z.drift_type !== 'aligned')
                     .sort((a, b) => (RISK_ORDER[a.drift_type] ?? 9) - (RISK_ORDER[b.drift_type] ?? 9))
                     .slice(0, 3)
  const ghosts    = zones.filter(z => z.drift_type === 'ghost')
  const nonAligned = zones.filter(z => z.drift_type !== 'aligned')
  const seenTypes = nonAligned.reduce<string[]>((acc, z) => {
    if (!acc.includes(z.drift_type)) acc.push(z.drift_type)
    return acc
  }, [])
  const cards: FallbackCard[] = seenTypes.map(dt => getFallbackCard(dt))
  const roadmapData = generateRoadmapReallocation({
    driftZones:         zones,
    correctionCards:    cards,
    concentrationScore: realityData.concentrationScore,
  })
  const summary   = founderSummary(zones)
  const analyzed  = p.last_analyzed ?? p.created_at

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-slate-700/60 bg-slate-950 px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-slate-800">|</span>
          <span className="text-sm font-extrabold text-[#FF8A1F]">DRIFT</span>
          <span className="text-sm text-slate-600">/ Founder Report</span>
        </div>
        <Link href={`/dashboard/${params.id}`}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-white">
          Ghost Mode <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-20">

        {/* HERO */}
        <section className={`rounded-3xl border bg-slate-900/60 p-10 shadow-2xl shadow-black/40 ${scoreBorder(p.drift_score)}`}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">Founder Report</p>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {p.name}
              </h1>
              <p className="text-sm text-slate-500">
                Last analyzed {new Date(analyzed).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[6rem] font-black leading-none tabular-nums ${scoreColor(p.drift_score)}`}>
                {p.drift_score}
              </p>
              <p className={`-mt-1 text-sm font-semibold ${scoreColor(p.drift_score)}`}>{scoreLabel(p.drift_score)}</p>
              <p className="text-xs text-slate-600">out of 100</p>
            </div>
          </div>
        </section>

        {/* EXECUTIVE SUMMARY */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">01 — Executive Summary</p>
          <FounderAlignmentMeter
            data={alignmentData}
            ghostFeatures={zones.filter(z => z.drift_type === 'ghost').length}
            overbuiltFeatures={zones.filter(z => z.drift_type === 'overbuilt').length}
            concentrationScore={realityData.concentrationScore}
            estimatedWaste={waste.estimatedCost}
          />
        </section>

        {/* TOP RISKS */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">02 — Top Risks</p>
          {topRisks.length === 0 ? (
            <p className="text-sm text-slate-500">No significant risks detected.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {topRisks.map(zone => (
                <div key={zone.id} className={`rounded-2xl border p-5 ${DRIFT_COLOR[zone.drift_type] ?? ''}`}>
                  <span className="mb-3 inline-block rounded-full bg-slate-900/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {zone.drift_type}
                  </span>
                  <p className="mb-2 text-base font-bold text-white">{zone.feature_name}</p>
                  <p className="text-xs leading-relaxed text-slate-400">{whyItMatters(zone)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRODUCT REALITY MAP */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">03 — Product Reality Map</p>
          <ProductRealityMap data={realityData} />
        </section>

        {/* ROADMAP REALLOCATION */}
        <section>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">04 — Roadmap Reallocation</p>
          <p className="mb-6 text-xs text-slate-600">What the roadmap says vs what user behavior suggests.</p>
          <RoadmapReallocation
            data={roadmapData}
            driftZones={zones}
            estimatedWaste={waste.estimatedCost}
            wastedSprints={waste.wastedSprints}
          />
        </section>

        {/* FEATURE LIFECYCLE */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">05 — Feature Lifecycle</p>
          {lifecycleItems.length === 0 ? (
            <p className="text-sm text-slate-500">No features analysed yet.</p>
          ) : (
            <FeatureTimeline items={lifecycleItems} />
          )}
        </section>

        {/* GHOST FEATURES */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">06 — Ghost Features</p>
          {ghosts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-emerald-400">
              No ghost features — all your builds are being used.
            </div>
          ) : (
            <div className="space-y-3">
              {ghosts.map(zone => (
                <div key={zone.id}
                  className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                  <Ghost className="mt-0.5 h-5 w-5 shrink-0 text-red-500/60" />
                  <div>
                    <p className="font-bold text-white">{zone.feature_name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Built as <span className="font-semibold text-slate-300">{zone.intended_priority}</span> priority.
                      <span className="ml-1 font-mono text-red-400">{zone.actual_usage_score}/100</span> usage.
                      Your users never found it.
                    </p>
                  </div>
                  <AlertTriangle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-red-500/40" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ENGINEERING IMPACT */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">07 — Engineering Impact</p>
          <div className={`rounded-2xl border p-8 shadow-xl shadow-black/30 ${costTheme.border} ${costTheme.bg}`}>
            {waste.wastedFeatures === 0 ? (
              <p className="text-sm text-slate-400">No engineering waste detected — all built features are being used.</p>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <p className={`text-5xl font-black tabular-nums ${costTheme.text}`}>
                      {formatCost(waste.estimatedCost)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Estimated Waste</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-5xl font-black tabular-nums ${costTheme.text}`}>{waste.wastedFeatures}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ghost Feature{waste.wastedFeatures !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-5xl font-black tabular-nums ${costTheme.text}`}>{waste.wastedSprints}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Sprints Lost</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                  <p className="text-xs text-slate-500">
                    Based on actual feature usage tracked through Novus. Estimate assumes {' '}
                    5 engineers × 10 days/sprint × $800/day. Ghost and overbuilt features only.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* AI RECOMMENDATIONS */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">08 — AI Recommendations</p>
          {cards.length === 0 ? (
            <p className="text-sm text-slate-500">No recommendations — product is well-aligned.</p>
          ) : (
            <div className="space-y-4">
              {cards.map((card, i) => (
                <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10">
                        <Zap className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <p className="text-base font-bold text-white">{card.title}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_COLOR[card.priority]}`}>
                      {card.priority}
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-slate-400">{card.user_story}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">Copy Rewrite</p>
                      <p className="text-xs text-slate-300">{card.copy_rewrite}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">Mockup</p>
                      <p className="text-xs text-slate-300">{card.mockup_suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOUNDER SUMMARY */}
        <section>
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">09 — Founder Summary</p>
          <blockquote className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-8 py-7">
            <p className="text-xl font-semibold leading-relaxed text-violet-100 md:text-2xl">
              &ldquo;{summary}&rdquo;
            </p>
          </blockquote>
        </section>

        {/* EXPORT */}
        <section className="flex items-center justify-between border-t border-slate-800/60 pt-8">
          <p className="text-xs text-slate-700">
            Generated by DRIFT · Powered by Novus.ai
          </p>
          <ExportButton
            projectName={p.name}
            score={p.drift_score}
            analyzedAt={analyzed ?? p.created_at}
            zones={zones}
            cards={cards}
            summary={summary}
          />
        </section>

      </div>
    </div>
  )
}
