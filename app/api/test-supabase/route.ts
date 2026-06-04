import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('projects')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        error,
        type: typeof error,
        stringified: JSON.stringify(error, null, 2),
      }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
