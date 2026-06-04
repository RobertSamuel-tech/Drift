import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spec_content } = body

    if (!spec_content || typeof spec_content !== 'string') {
      return NextResponse.json(
        { error: 'spec_content is required' },
        { status: 400 }
      )
    }

    if (spec_content.trim().length < 20) {
      return NextResponse.json(
        { error: 'spec_content must be at least 20 characters' },
        { status: 400 }
      )
    }

    const result = runAnalysis(spec_content)

    if (result.featuresFound === 0) {
      return NextResponse.json(
        { error: 'No features could be extracted from the provided spec' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[analyze]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
