import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { getFallbackCard } from '@/lib/fallback-cards'
import { calculateWasteMetrics } from '@/lib/cost-analysis'
import { buildFeatureLifecycle } from '@/lib/feature-lifecycle'
import { buildRealityMap } from '@/lib/reality-map'
import { calculateFounderAlignment } from '@/lib/founder-alignment'
import { generateRoadmapReallocation } from '@/lib/roadmap-reallocation'
import type { Project, DriftZone } from '@/lib/database.types'
import ReportDashboard from './ReportDashboard'

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
  const lifecycleItems = buildFeatureLifecycle(p, zones)
  const realityData    = buildRealityMap(zones)
  const alignmentData  = calculateFounderAlignment({
    driftScore:         p.drift_score,
    ghostFeatures:      zones.filter(z => z.drift_type === 'ghost').length,
    overbuiltFeatures:  zones.filter(z => z.drift_type === 'overbuilt').length,
    concentrationScore: realityData.concentrationScore,
  })
  const roadmapData = generateRoadmapReallocation({
    driftZones:         zones,
    correctionCards:    [],
    concentrationScore: realityData.concentrationScore,
  })
  const topRisks = [...zones]
    .filter(z => z.drift_type !== 'aligned')
    .sort((a, b) => (RISK_ORDER[a.drift_type] ?? 9) - (RISK_ORDER[b.drift_type] ?? 9))
    .slice(0, 3)
  const ghosts    = zones.filter(z => z.drift_type === 'ghost')
  const seenTypes = zones
    .filter(z => z.drift_type !== 'aligned')
    .reduce<string[]>((acc, z) => acc.includes(z.drift_type) ? acc : [...acc, z.drift_type], [])
  const cards    = seenTypes.map(dt => getFallbackCard(dt))
  const summary  = founderSummary(zones)
  const analyzed = p.last_analyzed ?? p.created_at

  return (
    <ReportDashboard
      project={p}
      zones={zones}
      waste={waste}
      realityData={realityData}
      alignmentData={alignmentData}
      roadmapData={roadmapData}
      lifecycleItems={lifecycleItems}
      cards={cards}
      topRisks={topRisks}
      ghosts={ghosts}
      summary={summary}
      analyzed={analyzed}
      projectId={params.id}
    />
  )
}
