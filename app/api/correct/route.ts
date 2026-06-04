import { NextRequest, NextResponse } from 'next/server'
import { generateCorrectionCard } from '@/lib/openai'
import { getFallbackCard } from '@/lib/fallback-cards'

interface ZoneInput {
  id: string
  feature_name: string
  drift_type: string
  actual_usage_score: number
  intended_priority: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zones } = body

    if (!Array.isArray(zones)) {
      return NextResponse.json(
        { error: 'zones must be an array' },
        { status: 400 }
      )
    }

    const relevant = (zones as ZoneInput[]).filter(z => z.drift_type !== 'aligned')

    const cards = await Promise.all(
      relevant.map(async zone => {
        try {
          const card = await generateCorrectionCard(
            zone.feature_name,
            zone.drift_type,
            {
              actual_usage_score: zone.actual_usage_score,
              intended_priority:  zone.intended_priority,
            },
            'Product spec drift analysis'
          )
          return { ...card, drift_zone_id: zone.id, ai_generated: true }
        } catch {
          const fallback = getFallbackCard(zone.drift_type)
          return { ...fallback, drift_zone_id: zone.id, ai_generated: false }
        }
      })
    )

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('[correct]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
