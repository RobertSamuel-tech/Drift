'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, Save, Loader2, Info } from 'lucide-react'
import DriftScore from './DriftScore'
import { calculateWasteMetrics, getCostTheme, formatCost } from '@/lib/cost-analysis'
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
  onSaveAndClose?: () => Promise<void>
}

export default function GhostMode({ project, specContent, novusData, driftZones, onSaveAndClose }: Props) {
  const [selectedZone, setSelectedZone] = useState<DriftZone | null>(null)
  const [panelOpen, setPanelOpen]       = useState(false)
  const [saving, setSaving]             = useState(false)

  const waste = calculateWasteMetrics(driftZones)
  const costTheme = getCostTheme(waste.estimatedCost)

  function handleZoneClick(zone: DriftZone) {
    setSelectedZone(zone)
    setPanelOpen(true)
  }

  async function handleSaveAndClose() {
    if (!onSaveAndClose) return
    setSaving(true)
    try { await onSaveAndClose() } finally { setSaving(false) }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/95 px-8 py-3 shadow-xl shadow-black/30 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Link href="/"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Ghost Mode</p>
            <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {waste.wastedFeatures > 0 && (
            <div className="hidden space-y-1.5 text-right md:block">
              <div className="flex items-center justify-end gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Ghost Features</span>
                <span className="text-sm font-bold text-white">{waste.wastedFeatures}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Est. Waste</span>
                <span className={`text-sm font-bold ${costTheme.text}`}>{formatCost(waste.estimatedCost)}</span>
                <span title="Estimate based on feature priority, sprint effort, and engineering cost assumptions.">
                  <Info className="h-3 w-3 cursor-help text-slate-700" />
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Time Lost</span>
                <span className="text-sm font-bold text-white">{waste.wastedSprints} Sprints</span>
              </div>
            </div>
          )}

          {onSaveAndClose && (
            <button
              onClick={handleSaveAndClose}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save & Close</>
              }
            </button>
          )}
          <DriftScore score={project.drift_score} />
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="h-64 overflow-hidden border-b border-slate-800/60 md:h-auto md:flex-1 md:border-b-0 md:border-r md:border-slate-800/60">
          <SpecViewer content={specContent} highlightedZones={driftZones} />
        </div>

        <div className="overflow-y-auto border-b border-slate-800/60 p-6 md:flex-1 md:border-b-0 md:border-r md:border-slate-800/60">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Drift Zones</p>
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
