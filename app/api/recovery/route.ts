import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export interface RecoveryPayload {
  project_id:   string
  feature_name: string
  drift_type:   string
  event_type:   'identified' | 'corrected'
}

export interface RecoveryResult {
  hasData:          boolean
  identifiedGhosts: number
  correctedGhosts:  number
  recoveryRate:     number
}

// ─── POST: store one recovery event ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: RecoveryPayload = await req.json()
    const { project_id, feature_name, drift_type, event_type } = body

    if (!project_id || !feature_name || !event_type) {
      return NextResponse.json({ error: 'project_id, feature_name, event_type required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('recovery_events').insert({
      project_id,
      feature_name,
      drift_type:  drift_type ?? 'ghost',
      event_type,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── GET: aggregate recovery metrics ─────────────────────────────────────────
// ?project_id=uuid   → per-project rate
// (no params)        → global rate across all projects

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('project_id')
    const supabase  = createAdminClient()

    let query = supabase
      .from('recovery_events')
      .select('project_id, feature_name, event_type')
      .eq('drift_type', 'ghost')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ hasData: false, error: error.message })
    if (!data || data.length === 0) return NextResponse.json({ hasData: false } satisfies RecoveryResult & { hasData: false })

    // Deduplicate by (project_id::feature_name) for global or feature_name for per-project
    const identified = new Set<string>()
    const corrected  = new Set<string>()

    for (const row of data) {
      const key = projectId
        ? row.feature_name
        : `${row.project_id}::${row.feature_name}`

      if (row.event_type === 'identified') identified.add(key)
      if (row.event_type === 'corrected')  corrected.add(key)
    }

    const identifiedCount = identified.size
    const correctedCount  = corrected.size

    const result: RecoveryResult = {
      hasData:          identifiedCount > 0,
      identifiedGhosts: identifiedCount,
      correctedGhosts:  correctedCount,
      recoveryRate:     identifiedCount > 0
        ? Math.round((correctedCount / identifiedCount) * 100)
        : 0,
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ hasData: false, error: String(err) })
  }
}
