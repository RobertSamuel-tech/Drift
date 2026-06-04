import {
  extractFeaturesFromSpec,
  calculateDriftScore,
  classifyDriftType,
  getDriftColor,
} from '@/lib/drift-algorithm'
import { DEMO_NOVUS_EVENTS } from '@/lib/demo-data'

export function runAnalysis(specContent: string) {
  const specFeatures = extractFeaturesFromSpec(specContent)
  const score = calculateDriftScore(specFeatures, DEMO_NOVUS_EVENTS)

  const zones = specFeatures.map((feature, i) => {
    const lower = feature.name.toLowerCase()
    const event =
      DEMO_NOVUS_EVENTS.find(e => e.name === feature.name) ||
      DEMO_NOVUS_EVENTS.find(e =>
        e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase())
      )

    const usageScore = event ? Math.min(event.avgPerSession * 10, 100) : 0
    const driftType  = classifyDriftType(feature, usageScore)
    const color      = getDriftColor(driftType)

    return {
      id:                 crypto.randomUUID(),
      feature_name:       feature.name,
      intended_priority:  feature.priority,
      actual_usage_score: usageScore,
      drift_type:         driftType,
      novus_event_name:   event?.name ?? null,
      position_x:         i % 3,
      position_y:         Math.floor(i / 3),
      color,
    }
  })

  return { score, zones, featuresFound: specFeatures.length }
}
