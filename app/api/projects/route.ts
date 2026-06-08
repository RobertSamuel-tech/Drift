import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const SPRINT_WEIGHT: Record<string, number> = { high: 1, medium: 0.5, low: 0.25 }
const SPRINT_DAYS   = 10
const TEAM_SIZE     = 5
const COST_PER_DAY  = 800

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, drift_score, spec_source, created_at, last_analyzed')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!projects || projects.length === 0) return NextResponse.json({ projects: [] })

    // Single batch query — no N+1
    const projectIds = projects.map(p => p.id)
    const { data: zones } = await supabase
      .from('drift_zones')
      .select('project_id, drift_type, intended_priority')
      .in('project_id', projectIds)

    // Compute ghost count + estimated waste per project using the same
    // formula as calculateWasteMetrics in lib/cost-analysis.ts
    const statsByProject = new Map<string, { ghost_count: number; estimated_waste: number }>()
    for (const id of projectIds) {
      const wasteZones = (zones ?? []).filter(
        z => z.project_id === id && (z.drift_type === 'ghost' || z.drift_type === 'overbuilt')
      )
      const sprints       = wasteZones.reduce((s, z) => s + (SPRINT_WEIGHT[z.intended_priority] ?? 0), 0)
      const estimatedWaste = Math.max(0, sprints * SPRINT_DAYS * TEAM_SIZE * COST_PER_DAY)
      statsByProject.set(id, { ghost_count: wasteZones.length, estimated_waste: estimatedWaste })
    }

    const enriched = projects.map(p => ({
      ...p,
      ghost_count:     statsByProject.get(p.id)?.ghost_count     ?? 0,
      estimated_waste: statsByProject.get(p.id)?.estimated_waste ?? 0,
    }))

    return NextResponse.json({ projects: enriched })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createAdminClient()

    const { error: zonesErr } = await supabase
      .from('drift_zones')
      .delete()
      .eq('project_id', id)
    if (zonesErr) return NextResponse.json({ error: zonesErr.message }, { status: 500 })

    const { error: projErr } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    if (projErr) return NextResponse.json({ error: projErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { name, spec_content, drift_score, zones } = await request.json()

    if (!spec_content || typeof drift_score !== 'number') {
      return NextResponse.json({ error: 'spec_content and drift_score required' }, { status: 400 })
    }

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({
        name:          name?.trim() || `Analysis ${new Date().toLocaleDateString('en-US')}`,
        spec_source:   'manual',
        spec_content,
        drift_score,
        last_analyzed: new Date().toISOString(),
      })
      .select()
      .single()

    if (projErr) return NextResponse.json({ error: projErr.message }, { status: 500 })

    if (Array.isArray(zones) && zones.length > 0) {
      const zoneRows = zones.map((z: Record<string, unknown>, i: number) => ({
        id:                 crypto.randomUUID(),
        project_id:         project.id,
        feature_name:       z.feature_name,
        intended_priority:  z.intended_priority,
        actual_usage_score: z.actual_usage_score,
        drift_type:         z.drift_type,
        novus_event_name:   z.novus_event_name ?? null,
        position_x:         z.position_x ?? i % 3,
        position_y:         z.position_y ?? Math.floor(i / 3),
        color:              z.color ?? null,
        created_at:         new Date().toISOString(),
      }))

      const { error: zonesErr } = await supabase.from('drift_zones').insert(zoneRows)
      if (zonesErr) console.error('[projects] zones insert:', zonesErr.message)
    }

    return NextResponse.json({ project_id: project.id, project }, { status: 201 })
  } catch (error) {
    console.error('[projects POST]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
