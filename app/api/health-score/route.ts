import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { calculateFounderAlignment } from '@/lib/founder-alignment'
import { buildRealityMap } from '@/lib/reality-map'
import { computeHealthScore } from '@/lib/health-score'
import type { HealthScore } from '@/lib/health-score'
import type { DriftZone } from '@/lib/database.types'

export type { HealthScore }

// GET /api/health-score                  → global health score
// GET /api/health-score?project_id=uuid  → per-project health score

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('project_id')
  const supabase  = createAdminClient()

  try {
    return NextResponse.json(
      projectId
        ? await perProjectHealth(supabase, projectId)
        : await globalHealth(supabase),
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Per-project ─────────────────────────────────────────────────────────────

async function perProjectHealth(
  supabase:  ReturnType<typeof createAdminClient>,
  projectId: string,
): Promise<HealthScore> {
  const [{ data: project }, { data: rawZones }, { data: events }] = await Promise.all([
    supabase.from('projects').select('drift_score').eq('id', projectId).single(),
    supabase.from('drift_zones').select('*').eq('project_id', projectId),
    supabase.from('recovery_events')
      .select('feature_name, event_type')
      .eq('project_id', projectId)
      .eq('drift_type', 'ghost'),
  ])

  const zones: DriftZone[] = (rawZones ?? []).map((z: any) => ({
    ...z,
    drift_type:        z.drift_type        as DriftZone['drift_type'],
    intended_priority: z.intended_priority as DriftZone['intended_priority'],
  }))

  // Recovery rate
  const identified = new Set<string>()
  const corrected  = new Set<string>()
  for (const e of (events ?? [])) {
    if (e.event_type === 'identified') identified.add(e.feature_name)
    if (e.event_type === 'corrected')  corrected.add(e.feature_name)
  }
  const identifiedCount = identified.size
  const correctedCount  = corrected.size
  const recoveryRate    = identifiedCount > 0
    ? Math.round((correctedCount / identifiedCount) * 100)
    : 0

  // Alignment index — exact same computation as report page
  const realityData    = buildRealityMap(zones)
  const alignmentData  = calculateFounderAlignment({
    driftScore:         project?.drift_score ?? 50,
    ghostFeatures:      zones.filter(z => z.drift_type === 'ghost').length,
    overbuiltFeatures:  zones.filter(z => z.drift_type === 'overbuilt').length,
    concentrationScore: realityData.concentrationScore,
  })

  // Feature adoption — mean actual_usage_score across all zones (ghosts are 0, which is correct)
  const scores          = zones.map(z => z.actual_usage_score)
  const featureAdoption = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  // Report activity — 1 correction = 25 pts, capped at 100
  const reportActivity = Math.min(100, correctedCount * 25)

  return computeHealthScore(
    {
      recoveryRate,
      alignmentIndex: alignmentData.alignmentIndex,
      featureAdoption,
      reportActivity,
    },
    correctedCount,
    identifiedCount,
  )
}

// ─── Global ──────────────────────────────────────────────────────────────────

async function globalHealth(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<HealthScore> {
  const [{ data: projects }, { data: zones }, { data: events }] = await Promise.all([
    supabase.from('projects').select('drift_score'),
    supabase.from('drift_zones').select('actual_usage_score'),
    supabase.from('recovery_events')
      .select('project_id, feature_name, event_type')
      .eq('drift_type', 'ghost'),
  ])

  // Recovery rate
  const identified = new Set<string>()
  const corrected  = new Set<string>()
  for (const e of (events ?? [])) {
    const key = `${e.project_id}::${e.feature_name}`
    if (e.event_type === 'identified') identified.add(key)
    if (e.event_type === 'corrected')  corrected.add(key)
  }
  const identifiedCount = identified.size
  const correctedCount  = corrected.size
  const recoveryRate    = identifiedCount > 0
    ? Math.round((correctedCount / identifiedCount) * 100)
    : 0

  // Alignment index — average drift_score (primary input to calculateFounderAlignment)
  const allProjects    = projects ?? []
  const alignmentIndex = allProjects.length > 0
    ? Math.round(allProjects.reduce((s: number, p: any) => s + p.drift_score, 0) / allProjects.length)
    : 50

  // Feature adoption — average usage score across all zones fleet-wide
  const allZones        = zones ?? []
  const featureAdoption = allZones.length > 0
    ? Math.round(allZones.reduce((s: number, z: any) => s + z.actual_usage_score, 0) / allZones.length)
    : 0

  // Report activity — 10 corrections across fleet = 100
  const reportActivity = Math.min(100, correctedCount * 10)

  return computeHealthScore(
    { recoveryRate, alignmentIndex, featureAdoption, reportActivity },
    correctedCount,
    identifiedCount,
  )
}
