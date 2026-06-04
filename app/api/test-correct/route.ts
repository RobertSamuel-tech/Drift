import { NextResponse } from 'next/server'
import { generateCorrectionCard } from '@/lib/openai'
import { getFallbackCard } from '@/lib/fallback-cards'
import { DEMO_ZONES } from '@/lib/demo-data'

export async function GET() {
  const zone = DEMO_ZONES.find(z => z.drift_type !== 'aligned') ?? DEMO_ZONES[0]

  try {
    const card = await generateCorrectionCard(
      zone.feature_name,
      zone.drift_type,
      {
        actual_usage_score: zone.actual_usage_score,
        intended_priority:  zone.intended_priority,
      },
      'TaskFlow Pro — product spec drift analysis'
    )
    return NextResponse.json({ zone: zone.feature_name, drift_type: zone.drift_type, card, ai_generated: true })
  } catch (error) {
    const fallback = getFallbackCard(zone.drift_type)
    return NextResponse.json({
      zone:        zone.feature_name,
      drift_type:  zone.drift_type,
      card:        fallback,
      ai_generated: false,
      fallback_reason: String(error),
    })
  }
}
