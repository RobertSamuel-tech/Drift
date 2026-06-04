'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import DriftScore from './DriftScore'
import DriftGrid from './DriftGrid'
import SpecViewer from './SpecViewer'
import NovusFeed from './NovusFeed'
import CorrectionPanel from './CorrectionPanel'
import type { Project, DriftZone } from '@/lib/database.types'
import type { NovusEvent } from '@/lib/drift-algorithm'

interface Props {
  project: Project
  specContent: string
  novusData: NovusEvent[]
  driftZones: DriftZone[]
}

export default function GhostMode({ project, specContent, novusData, driftZones }: Props) {
  const [selectedZone, setSelectedZone] = useState<DriftZone | null>(null)
  const [panelOpen, setPanelOpen]       = useState(false)

  function handleZoneClick(zone: DriftZone) {
    setSelectedZone(zone)
    setPanelOpen(true)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/95 px-8 py-3 shadow-xl shadow-black/30 backdrop-blur-xl"
      >
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Ghost Mode</p>
          <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
        </div>
        <DriftScore score={project.drift_score} />
      </motion.header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="h-64 overflow-hidden border-b border-slate-800/60 md:h-auto md:flex-1 md:border-b-0 md:border-r md:border-slate-800/60">
          <SpecViewer content={specContent} highlightedZones={driftZones} />
        </div>

        <div className="overflow-y-auto border-b border-slate-800/60 p-6 md:flex-1 md:border-b-0 md:border-r md:border-slate-800/60">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Drift Zones
          </p>
          <DriftGrid zones={driftZones} onZoneClick={handleZoneClick} />
        </div>

        <div className="relative overflow-hidden p-4 md:flex-1">
          <NovusFeed events={novusData} />
          <span className="pointer-events-none absolute bottom-5 right-5 rounded-full border border-slate-700/50 bg-slate-900/80 px-3 py-1 text-[10px] font-medium tracking-wide text-slate-500 backdrop-blur-sm">
            Powered by Novus.ai
          </span>
        </div>
      </div>

      <CorrectionPanel zone={selectedZone} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
