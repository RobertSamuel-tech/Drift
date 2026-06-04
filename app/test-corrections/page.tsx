'use client'

import { useState } from 'react'
import CorrectionPanel from '@/components/CorrectionPanel'
import { DEMO_ZONES } from '@/lib/demo-data'

const demoZone = DEMO_ZONES.find(z => z.drift_type !== 'aligned') ?? DEMO_ZONES[0]

export default function TestCorrectionsPage() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <button
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        onClick={() => setOpen(true)}
      >
        Open Corrections
      </button>
      <CorrectionPanel zone={demoZone} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}
