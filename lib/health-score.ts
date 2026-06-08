// Product Health Score — computation layer.
//
// Formula:
//   40% Drift Recovery Rate   (corrected / identified ghosts)
//   30% Alignment Index       (calculateFounderAlignment output)
//   20% Feature Adoption      (mean actual_usage_score across all zones)
//   10% Report Activity       (correction events, normalized 0–100)
//
// Trend signal:
//   correctedGhosts > 0                              → improving
//   identifiedGhosts > 0 && correctedGhosts === 0    → declining
//   no recovery data: score >= 50                    → improving, else declining

export interface HealthScoreBreakdown {
  recoveryRate:    number  // 0–100
  alignmentIndex:  number  // 0–100
  featureAdoption: number  // 0–100
  reportActivity:  number  // 0–100
}

export interface HealthScore {
  score:     number
  trend:     'improving' | 'declining'
  breakdown: HealthScoreBreakdown
}

export function computeHealthScore(
  breakdown:        HealthScoreBreakdown,
  correctedGhosts:  number,
  identifiedGhosts: number,
): HealthScore {
  const score = Math.round(
    breakdown.recoveryRate    * 0.40 +
    breakdown.alignmentIndex  * 0.30 +
    breakdown.featureAdoption * 0.20 +
    breakdown.reportActivity  * 0.10,
  )

  let trend: 'improving' | 'declining'
  if (correctedGhosts > 0) {
    trend = 'improving'
  } else if (identifiedGhosts > 0) {
    trend = 'declining'
  } else {
    trend = score >= 50 ? 'improving' : 'declining'
  }

  return { score, trend, breakdown }
}

export function healthScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 45) return 'text-amber-400'
  return 'text-red-400'
}

export function healthScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/30'
  if (score >= 45) return 'bg-amber-500/10  border-amber-500/30'
  return 'bg-red-500/10 border-red-500/30'
}

export function healthScoreLabel(score: number): string {
  if (score >= 70) return 'STRONG'
  if (score >= 45) return 'AT RISK'
  return 'CRITICAL'
}

export function barColor(value: number): string {
  if (value >= 70) return 'bg-emerald-500'
  if (value >= 45) return 'bg-amber-500'
  return 'bg-red-500'
}
