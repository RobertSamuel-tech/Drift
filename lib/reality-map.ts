import type { DriftZone } from './database.types'

export interface RealityFeature {
  name:       string
  priority:   string
  usageScore: number
  driftType:  string
}

export interface RealityMap {
  intendedFeatures:   RealityFeature[]
  actualFeatures:     RealityFeature[]
  dominantFeature:    string
  concentrationScore: number
  realitySummary:     string
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

function toFeature(z: DriftZone): RealityFeature {
  return {
    name:       z.feature_name,
    priority:   z.intended_priority,
    usageScore: z.actual_usage_score,
    driftType:  z.drift_type,
  }
}

export function buildRealityMap(driftZones: DriftZone[]): RealityMap {
  if (driftZones.length === 0) {
    return {
      intendedFeatures:   [],
      actualFeatures:     [],
      dominantFeature:    '—',
      concentrationScore: 0,
      realitySummary:     'No features analysed yet.',
    }
  }

  const intendedFeatures = [...driftZones]
    .sort((a, b) => (PRIORITY_RANK[a.intended_priority] ?? 3) - (PRIORITY_RANK[b.intended_priority] ?? 3))
    .map(toFeature)

  const actualFeatures = [...driftZones]
    .sort((a, b) => b.actual_usage_score - a.actual_usage_score)
    .map(toFeature)

  const totalUsage = driftZones.reduce((s, z) => s + z.actual_usage_score, 0)
  const topUsage   = Math.max(...driftZones.map(z => z.actual_usage_score))

  const concentrationScore = totalUsage === 0 ? 0 : Math.round((topUsage / totalUsage) * 100)

  const dominant       = actualFeatures[0]
  const dominantFeature = totalUsage > 0 && dominant.usageScore > 0 ? dominant.name : '—'

  let realitySummary: string
  if (totalUsage === 0) {
    realitySummary = 'No measurable user activity detected across any features.'
  } else if (concentrationScore > 70) {
    realitySummary = `You are operating a single-feature product. "${dominantFeature}" dominates user engagement.`
  } else if (concentrationScore > 50) {
    realitySummary = `Most user value comes from a small portion of the roadmap. "${dominantFeature}" leads adoption.`
  } else {
    realitySummary = 'Usage is distributed across multiple features.'
  }

  return { intendedFeatures, actualFeatures, dominantFeature, concentrationScore, realitySummary }
}
