'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GhostMode from '@/components/GhostMode'
import { DEMO_NOVUS_EVENTS } from '@/lib/demo-data'
import { getSession } from '@/lib/analysis-session'
import type { Project, DriftZone } from '@/lib/database.types'

export default function GhostSessionPage() {
  const router = useRouter()
  const [project, setProject]     = useState<Project | null>(null)
  const [zones, setZones]         = useState<DriftZone[]>([])
  const [specContent, setSpecContent] = useState('')

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/analyze'); return }

    setProject({
      id:               'session',
      user_id:          'session',
      name:             session.projectName || 'Unsaved Analysis',
      novus_project_id: null,
      spec_source:      'manual',
      spec_content:     session.spec,
      spec_url:         null,
      drift_score:      session.score,
      last_analyzed:    session.createdAt,
      created_at:       session.createdAt,
    })
    setZones(session.zones)
    setSpecContent(session.spec)
  }, [router])

  if (!project) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <span className="font-mono text-xs uppercase tracking-widest text-slate-600">Loading…</span>
    </div>
  )

  return (
    <GhostMode
      project={project}
      specContent={specContent}
      novusData={DEMO_NOVUS_EVENTS}
      driftZones={zones}
    />
  )
}
