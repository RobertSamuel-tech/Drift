'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, Save, Loader2, Activity } from 'lucide-react'
import { calculateWasteMetrics, getCostTheme, formatCost } from '@/lib/cost-analysis'
import DriftGrid from './DriftGrid'
import SpecViewer from './SpecViewer'
import NovusFeed from './NovusFeed'
import CorrectionPanel from './CorrectionPanel'
import type { Project, DriftZone } from '@/lib/database.types'
import type { NovusEvent } from '@/lib/drift-algorithm'

interface Props {
  project:        Project
  specContent:    string
  novusData:      NovusEvent[]
  driftZones:     DriftZone[]
  onSaveAndClose?: () => Promise<void>
}

// Inline metric block — command-center header readout
function StatBlock({
  label,
  value,
  valueClass = 'text-white',
  tooltip,
}: {
  label: string
  value: string
  valueClass?: string
  tooltip?: string
}) {
  return (
    <div
      className="flex flex-col items-end gap-0.5 border-l border-slate-700/60 pl-4 first:border-0 first:pl-0"
      title={tooltip}
    >
      <span className={`font-mono text-lg font-bold tabular-nums leading-none ${valueClass}`}>
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </span>
    </div>
  )
}

// Panel section header — monospace uppercase with status dot
function PanelHeader({
  title,
  status,
  dotColor = 'bg-slate-600',
}: {
  title: string
  status?: string
  dotColor?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          {title}
        </span>
      </div>
      {status && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          {status}
        </span>
      )}
    </div>
  )
}

export default function GhostMode({
  project,
  specContent,
  novusData,
  driftZones,
  onSaveAndClose,
}: Props) {
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
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-sans text-white">

      {/* ── Command header ─────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex h-14 shrink-0 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-4"
      >
        {/* Left: breadcrumb + project */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Link href="/"
              className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-300">
              <ArrowLeft className="h-3 w-3" /> HOME
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-300">
              <LayoutDashboard className="h-3 w-3" /> ARCHIVE
            </Link>
          </div>
          <span className="text-slate-800">/</span>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-500/70" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                GHOST ANALYSIS
              </span>
              <p className="font-sans text-sm font-semibold leading-none text-white">
                {project.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right: metric readouts + drift score + save */}
        <div className="flex items-center gap-4">
          {/* Inline stat blocks */}
          <div className="hidden items-center gap-4 md:flex">
            <StatBlock
              label="DRIFT SCORE"
              value={String(project.drift_score)}
              valueClass={project.drift_score >= 80 ? 'text-emerald-400' : project.drift_score >= 50 ? 'text-amber-400' : 'text-red-400'}
            />
            {waste.wastedFeatures > 0 && (
              <>
                <StatBlock
                  label="GHOST FEATURES"
                  value={String(waste.wastedFeatures)}
                  valueClass="text-red-400"
                />
                <StatBlock
                  label="EST. WASTE"
                  value={formatCost(waste.estimatedCost)}
                  valueClass={costTheme.text}
                  tooltip="5 engineers × 10 days/sprint × $800/day"
                />
                <StatBlock
                  label="SPRINTS LOST"
                  value={String(waste.wastedSprints)}
                  valueClass="text-amber-400"
                />
              </>
            )}
          </div>

          {onSaveAndClose && (
            <button
              onClick={handleSaveAndClose}
              disabled={saving}
              className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/15 disabled:opacity-50"
            >
              {saving
                ? <><Loader2 className="h-3 w-3 animate-spin" /> SAVING</>
                : <><Save className="h-3 w-3" /> SAVE & CLOSE</>}
            </button>
          )}
        </div>
      </motion.header>

      {/* ── Three-panel body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Product Intent (25%) */}
        <div className="flex w-[25%] shrink-0 flex-col overflow-hidden border-r border-slate-800/60">
          <PanelHeader
            title="Product Intent"
            status={`${driftZones.length} features`}
            dotColor="bg-slate-500"
          />
          <div className="flex-1 overflow-hidden">
            <SpecViewer content={specContent} highlightedZones={driftZones} />
          </div>
        </div>

        {/* CENTER — Drift Analysis (45%) */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-800/60">
          <PanelHeader
            title="Drift Analysis"
            status="NOVUS BACKED"
            dotColor="bg-emerald-500"
          />
          <div className="flex-1 overflow-y-auto p-4">
            <DriftGrid zones={driftZones} onZoneClick={handleZoneClick} />
          </div>
        </div>

        {/* RIGHT — User Reality (30%) */}
        <div className="flex w-[30%] shrink-0 flex-col overflow-hidden">
          <PanelHeader
            title="User Reality"
            status="LIVE"
            dotColor="bg-emerald-400"
          />
          <div className="relative flex-1 overflow-hidden p-3">
            <NovusFeed events={novusData} />
            <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-widest text-slate-700">
              Powered by Novus.ai
            </span>
          </div>
        </div>
      </div>

      <CorrectionPanel zone={selectedZone} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
