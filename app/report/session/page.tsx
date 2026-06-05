'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Save, ArrowRight, BarChart2 } from 'lucide-react'
import { getSession, clearSession } from '@/lib/analysis-session'
import { analytics } from '@/lib/novus'
import { calculateWasteMetrics } from '@/lib/cost-analysis'
import { buildFeatureLifecycle } from '@/lib/feature-lifecycle'
import { buildRealityMap } from '@/lib/reality-map'
import { calculateFounderAlignment } from '@/lib/founder-alignment'
import { generateRoadmapReallocation } from '@/lib/roadmap-reallocation'
import { getFallbackCard } from '@/lib/fallback-cards'
import ReportDashboard from '@/app/report/[id]/ReportDashboard'
import type { ReportDashboardProps } from '@/app/report/[id]/ReportDashboard'
import type { Project, DriftZone } from '@/lib/database.types'

const RISK_ORDER: Record<string, number> = { ghost: 0, overbuilt: 1, misunderstood: 2, underbuilt: 3 }

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

function buildReportProps(spec: string, projectName: string, score: number, zones: DriftZone[], createdAt: string): ReportDashboardProps {
  const p: Project = {
    id:               'session',
    user_id:          'session',
    name:             projectName || 'Unsaved Analysis',
    novus_project_id: null,
    spec_source:      'manual',
    spec_content:     spec,
    spec_url:         null,
    drift_score:      score,
    last_analyzed:    createdAt,
    created_at:       createdAt,
  }

  const waste         = calculateWasteMetrics(zones)
  const realityData   = buildRealityMap(zones)
  const alignmentData = calculateFounderAlignment({
    driftScore:         p.drift_score,
    ghostFeatures:      zones.filter(z => z.drift_type === 'ghost').length,
    overbuiltFeatures:  zones.filter(z => z.drift_type === 'overbuilt').length,
    concentrationScore: realityData.concentrationScore,
  })
  const roadmapData    = generateRoadmapReallocation({ driftZones: zones, correctionCards: [], concentrationScore: realityData.concentrationScore })
  const lifecycleItems = buildFeatureLifecycle(p, zones)
  const topRisks       = [...zones]
    .filter(z => z.drift_type !== 'aligned')
    .sort((a, b) => (RISK_ORDER[a.drift_type] ?? 9) - (RISK_ORDER[b.drift_type] ?? 9))
    .slice(0, 3)
  const ghosts    = zones.filter(z => z.drift_type === 'ghost')
  const seenTypes = zones
    .filter(z => z.drift_type !== 'aligned')
    .reduce<string[]>((acc, z) => acc.includes(z.drift_type) ? acc : [...acc, z.drift_type], [])
  const cards   = seenTypes.map(dt => getFallbackCard(dt))
  const summary = founderSummary(zones)

  return { project: p, zones, waste, realityData, alignmentData, roadmapData, lifecycleItems, cards, topRisks, ghosts, summary, analyzed: createdAt, projectId: 'session' }
}

export default function ReportSessionPage() {
  const router = useRouter()
  const [reportProps, setReportProps] = useState<ReportDashboardProps | null>(null)
  const [saving, setSaving]           = useState(false)
  const [savedId, setSavedId]         = useState<string | null>(null)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [rawSession, setRawSession]   = useState<{ spec: string; projectName: string; score: number; zones: DriftZone[] } | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/analyze'); return }
    setRawSession({ spec: session.spec, projectName: session.projectName, score: session.score, zones: session.zones })
    setReportProps(buildReportProps(session.spec, session.projectName, session.score, session.zones, session.createdAt))
    analytics.reportGenerated({ score: session.score, featuresFound: session.featuresFound })
  }, [router])

  async function handleSave() {
    if (!rawSession) return
    setSaveError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         rawSession.projectName || 'New Analysis',
          spec_content: rawSession.spec,
          drift_score:  rawSession.score,
          zones:        rawSession.zones,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error ?? 'Save failed'); return }
      setSavedId(data.project_id)
      analytics.analysisSaved({ projectId: data.project_id, score: rawSession.score })
      clearSession()
    } catch {
      setSaveError('Network error — could not save')
    } finally {
      setSaving(false)
    }
  }

  if (!reportProps) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <span className="font-mono text-xs uppercase tracking-widest text-slate-600">Loading session…</span>
    </div>
  )

  return (
    <div>
      {/* Unsaved session banner */}
      {!savedId && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-500/8 px-8 py-2.5">
          <div className="flex items-center gap-3">
            <Link href="/analyze?restore=1"
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300">
              <ArrowRight className="h-3 w-3 rotate-180" /> Analyze
            </Link>
            <span className="h-3 w-px bg-amber-500/20" />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
                Unsaved Analysis · Not yet in your archive
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveError && <span className="font-mono text-xs text-red-400">{saveError}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-40"
            >
              {saving
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
                : <><Save className="h-3 w-3" /> Save to Dashboard</>}
            </button>
          </div>
        </div>
      )}

      {/* Saved confirmation banner */}
      {savedId && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-emerald-500/30 bg-emerald-500/8 px-8 py-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="font-mono text-xs uppercase tracking-widest">Analysis saved to Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-white">
              View Archive <ArrowRight className="h-3 w-3" />
            </Link>
            <Link href={`/report/${savedId}`}
              className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/20">
              <BarChart2 className="h-3 w-3" /> Open Saved Report
            </Link>
          </div>
        </div>
      )}

      <ReportDashboard {...reportProps} />
    </div>
  )
}
