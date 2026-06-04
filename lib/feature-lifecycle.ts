import type { Project, DriftZone } from './database.types'

export type LifecycleStage = 'Ghost' | 'Ignored' | 'Partial Adoption' | 'Core Product'

export interface FeatureLifecycleItem {
  featureName:    string
  priority:       string
  driftType:      string
  createdAt:      string
  analyzedAt:     string
  usageScore:     number
  lifecycleStage: LifecycleStage
}

export const STAGE_ORDER: Record<LifecycleStage, number> = {
  'Ghost':            0,
  'Ignored':          1,
  'Partial Adoption': 2,
  'Core Product':     3,
}

export function getLifecycleStage(usageScore: number): LifecycleStage {
  if (usageScore === 0)                    return 'Ghost'
  if (usageScore > 0 && usageScore < 20)  return 'Ignored'
  if (usageScore >= 20 && usageScore < 60) return 'Partial Adoption'
  return 'Core Product'
}

export function buildFeatureLifecycle(
  project: Project,
  driftZones: DriftZone[]
): FeatureLifecycleItem[] {
  const analyzedAt = project.last_analyzed ?? project.created_at

  return driftZones
    .map(zone => ({
      featureName:    zone.feature_name,
      priority:       zone.intended_priority,
      driftType:      zone.drift_type,
      createdAt:      project.created_at,
      analyzedAt,
      usageScore:     zone.actual_usage_score,
      lifecycleStage: getLifecycleStage(zone.actual_usage_score),
    }))
    .sort((a, b) => STAGE_ORDER[a.lifecycleStage] - STAGE_ORDER[b.lifecycleStage])
}
