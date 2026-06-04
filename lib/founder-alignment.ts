export type AlignmentSeverity = 'Aligned' | 'Concern' | 'High Risk' | 'Critical Misalignment'

export interface FounderAlignment {
  alignmentIndex: number
  regretIndex:    number
  severity:       AlignmentSeverity
  summary:        string
}

export interface FounderAlignmentInput {
  driftScore:          number
  ghostFeatures:       number
  overbuiltFeatures:   number
  concentrationScore:  number
}

const SUMMARIES: Record<AlignmentSeverity, string> = {
  'Aligned':               'User behavior closely matches founder intent.',
  'Concern':               'Several roadmap investments show weaker adoption than expected.',
  'High Risk':             'Users are ignoring key product investments.',
  'Critical Misalignment': 'Large portions of engineering effort are not creating user value.',
}

export function calculateFounderAlignment(input: FounderAlignmentInput): FounderAlignment {
  const { driftScore, ghostFeatures, overbuiltFeatures, concentrationScore } = input

  let score = driftScore
  score -= ghostFeatures    * 8
  score -= overbuiltFeatures * 5
  if (concentrationScore > 85) score -= 15
  else if (concentrationScore > 70) score -= 10

  const alignmentIndex = Math.max(0, Math.min(100, Math.round(score)))
  const regretIndex    = 100 - alignmentIndex

  let severity: AlignmentSeverity
  if      (regretIndex <= 25) severity = 'Aligned'
  else if (regretIndex <= 50) severity = 'Concern'
  else if (regretIndex <= 75) severity = 'High Risk'
  else                        severity = 'Critical Misalignment'

  return { alignmentIndex, regretIndex, severity, summary: SUMMARIES[severity] }
}
