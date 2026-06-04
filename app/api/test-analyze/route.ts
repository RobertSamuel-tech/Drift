import { NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'
import { DEMO_PROJECT } from '@/lib/demo-data'

export async function GET() {
  try {
    const result = runAnalysis(DEMO_PROJECT.spec_content ?? '')
    return NextResponse.json({ source: 'DEMO_PROJECT', ...result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
