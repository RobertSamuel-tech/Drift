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
import { spring } from '@/components/ui/drift-theme'

interface Props {
  project:        Project
  specContent:    string
  novusData:      NovusEvent[]
  driftZones:     DriftZone[]
  onSaveAndClose?: () => Promise<void>
}

function MetricChip({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-2 shadow-md shadow-black/20 backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`mt-0.5 text-sm font-black tabular-nums ${valueClass ?? 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function GhostMode({ project, specContent, novusData, driftZones, onSaveAndClose }: Props) {
  const [selectedZone, setSelectedZone] = useState<DriftZone | null>(null)
  const [panelOpen, setPanelOpen]       = useState(false)
  const [saving, setSaving]             = useState(false)

  const waste     = calculateWasteMetrics(driftZones)
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

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ...spring.panel }}
        className="flex shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/90 px-6 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {/* Left: nav + project title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Link href="/"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-slate-800/60 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-slate-800/60 hover:text-white">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
          <div className="h-4 w-px bg-slate-800/80" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Ghost Mode</p>
            <h1 className="text-lg font-bold tracking-tight text-white">{project.name}</h1>
          </div>
        </div>

        {/* Right: metrics + score */}
        <div className="flex items-center gap-3">
          {waste.wastedFeatures > 0 && (
            <div className="hidden items-center gap-2.5 md:flex">
              <MetricChip label="Ghost Features"  value={String(waste.wastedFeatures)} />
              <MetricChip label="Est. Waste"       value={formatCost(waste.estimatedCost)} valueClass={costTheme.text} />
              <MetricChip label="Time Lost"        value={`${waste.wastedSprints} Sprints`} />
              <span title="Estimate based on feature priority, sprint effort, and engineering cost.">
                <Info className="h-3 w-3 cursor-help text-slate-700" />
              </span>
            </div>
          )}

          {onSaveAndClose && (
            <button
              onClick={handleSaveAndClose}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-md shadow-black/20 transition-all hover:bg-emerald-500/20 hover:shadow-lg disabled:opacity-50"
            >
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save & Close</>}
            </button>
          )}

          <DriftScore score={project.drift_score} />
        </div>
      </motion.header>

      {/* ── Three-pane body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">

        {/* Spec Viewer */}
        <div className="h-64 overflow-hidden border-b border-slate-800/50 md:h-auto md:flex-1 md:border-b-0 md:border-r md:border-slate-800/50">
          <SpecViewer content={specContent} highlightedZones={driftZones} />
        </div>

        {/* Drift Zones */}
        <div className="overflow-y-auto border-b border-slate-800/50 p-5 md:flex-1 md:border-b-0 md:border-r md:border-slate-800/50">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Drift Zones</p>
          <DriftGrid zones={driftZones} onZoneClick={handleZoneClick} />
        </div>

        {/* Novus Feed */}
        <div className="relative overflow-hidden p-4 md:flex-1">
          <NovusFeed events={novusData} />
          <span className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-slate-700/40 bg-slate-900/80 px-3 py-1 text-[10px] font-medium tracking-wide text-slate-600 backdrop-blur-sm">
            Powered by Novus.ai
          </span>
        </div>
      </div>

      <CorrectionPanel zone={selectedZone} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
