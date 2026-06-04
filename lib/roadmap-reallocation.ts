import type { DriftZone } from './database.types'
import type { FallbackCard } from './fallback-cards'

export interface RoadmapAction {
  featureName: string
  reason:      string
  confidence:  number
  evidence:    string
}

export interface RoadmapReallocationResult {
  remove:  RoadmapAction[]
  improve: RoadmapAction[]
  invest:  RoadmapAction[]
  summary: string
}

export interface RoadmapInput {
  driftZones:         DriftZone[]
  correctionCards:    FallbackCard[]
  concentrationScore: number
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function pct(n: number) { return Math.min(100, Math.max(0, Math.round(n))) }

function buildSummary(
  invest:  RoadmapAction[],
  remove:  RoadmapAction[],
  improve: RoadmapAction[],
  zones:   DriftZone[],
): string {
  const investNames = invest.slice(0, 2).map(a => `"${a.featureName}"`).join(' and ')
  const removeNames = remove.slice(0, 2).map(a => `"${a.featureName}"`).join(' and ')
  const topUnderbuilt = zones.find(z => z.drift_type === 'underbuilt')

  if (remove.length > 0 && invest.length > 0) {
    return (
      `Engineering effort appears concentrated on low-adoption features ` +
      `(${removeNames}), while ${investNames} ` +
      `${invest.length === 1 ? 'drives' : 'drive'} most measurable user value. ` +
      `Reallocating sprint capacity toward high-engagement areas could recover meaningful product ROI.`
    )
  }
  if (remove.length > 0 && improve.length > 0) {
    return (
      `${removeNames} ${remove.length === 1 ? 'shows' : 'show'} zero adoption despite roadmap investment. ` +
      `Redirecting that capacity to "${improve[0].featureName}" — which already shows user demand — ` +
      `would align engineering output with actual product behavior.`
    )
  }
  if (remove.length > 0) {
    return (
      `${removeNames} ${remove.length === 1 ? 'consumes' : 'consume'} sprint capacity with no measurable user return. ` +
      `Removing ${remove.length === 1 ? 'it' : 'them'} from active development frees resources for higher-impact work.`
    )
  }
  if (invest.length > 0 && topUnderbuilt) {
    return (
      `"${topUnderbuilt.feature_name}" is being treated as ${topUnderbuilt.intended_priority} priority ` +
      `despite driving strong user engagement. Increasing investment here ` +
      `would align roadmap priorities with actual usage data.`
    )
  }
  if (invest.length > 0) {
    return (
      `${investNames} ${invest.length === 1 ? 'is' : 'are'} driving user engagement above ` +
      `${invest.length === 1 ? 'its' : 'their'} current roadmap priority. ` +
      `Increasing sprint allocation here aligns engineering effort with actual user behavior.`
    )
  }
  if (improve.length > 0) {
    return (
      `Several features show user demand that exceeds their current roadmap priority. ` +
      `Incremental investment in "${improve[0].featureName}" could yield measurable adoption gains.`
    )
  }
  return 'Roadmap priorities appear aligned with user behavior. Continue monitoring with each release cycle.'
}

// ─── main export ──────────────────────────────────────────────────────────────

export function generateRoadmapReallocation(input: RoadmapInput): RoadmapReallocationResult {
  const { driftZones, correctionCards, concentrationScore } = input

  if (driftZones.length === 0) {
    return { remove: [], improve: [], invest: [], summary: 'No features analysed yet.' }
  }

  const totalUsage = driftZones.reduce((s, z) => s + z.actual_usage_score, 0)

  // Identify top-20% usage features
  const sorted     = [...driftZones].sort((a, b) => b.actual_usage_score - a.actual_usage_score)
  const topCount   = Math.max(1, Math.ceil(driftZones.length * 0.2))
  const topSet     = new Set(sorted.slice(0, topCount).map(z => z.id))
  const dominantId = sorted[0].id

  const remove:   RoadmapAction[] = []
  const improve:  RoadmapAction[] = []
  const invest:   RoadmapAction[] = []
  const assigned  = new Set<string>()

  // ── INVEST (top 20% with strong engagement) ────────────────────────────────
  for (const z of driftZones) {
    if (!topSet.has(z.id) || z.actual_usage_score < 60) continue
    const usageShare  = totalUsage > 0 ? Math.round((z.actual_usage_score / totalUsage) * 100) : 0
    const domBonus    = concentrationScore > 70 && z.id === dominantId ? 7 : 0
    const usageBonus  = Math.round((z.actual_usage_score / 100) * 5)
    invest.push({
      featureName: z.feature_name,
      reason:      `${z.actual_usage_score}/100 usage score with ${z.intended_priority} priority treatment — user demand exceeds current roadmap allocation.`,
      confidence:  pct(85 + domBonus + usageBonus),
      evidence:    `This feature drives a disproportionate amount of user activity — ${usageShare}% of all tracked usage in this product.`,
    })
    assigned.add(z.id)
  }

  // ── REMOVE (ghost + zero usage) ────────────────────────────────────────────
  for (const z of driftZones) {
    if (assigned.has(z.id)) continue
    if (z.drift_type !== 'ghost' || z.actual_usage_score !== 0) continue
    remove.push({
      featureName: z.feature_name,
      reason:      `Built as ${z.intended_priority} priority with no measurable user adoption across any tracked session.`,
      confidence:  z.intended_priority === 'high' ? 95 : 90,
      evidence:    'No measurable usage detected. Continuing to maintain this feature consumes sprint capacity with zero user return.',
    })
    assigned.add(z.id)
  }

  // ── IMPROVE (usageScore > 50 or underbuilt, not already assigned) ──────────
  for (const z of driftZones) {
    if (assigned.has(z.id)) continue
    if (z.actual_usage_score <= 50 && z.drift_type !== 'underbuilt') continue
    const usageBonus = Math.round((z.actual_usage_score / 100) * 20)
    improve.push({
      featureName: z.feature_name,
      reason:      z.drift_type === 'underbuilt'
        ? `Treated as ${z.intended_priority} priority but shows ${z.actual_usage_score}/100 usage — users value this more than the spec does.`
        : `${z.actual_usage_score}/100 usage score indicates consistent user demand that the current roadmap underweights.`,
      confidence:  pct(75 + usageBonus),
      evidence:    'Users repeatedly engage with this feature. Investment here aligns roadmap effort with actual user behavior.',
    })
    assigned.add(z.id)
  }

  // Sort each bucket by confidence DESC
  const byConf = (a: RoadmapAction, b: RoadmapAction) => b.confidence - a.confidence
  invest.sort(byConf)
  improve.sort(byConf)
  remove.sort(byConf)

  // Attach correction card rationale to the summary if available
  void correctionCards // used for future AI rationale enrichment; currently summary derives from zones

  const summary = buildSummary(invest, remove, improve, driftZones)

  return { remove, improve, invest, summary }
}
