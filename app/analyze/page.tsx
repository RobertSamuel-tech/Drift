'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Sparkles, AlertCircle, Wand2, Save, CheckCircle, Maximize2, BarChart2, ArrowRight } from 'lucide-react'
import DriftScore from '@/components/DriftScore'
import DriftGrid from '@/components/DriftGrid'
import CorrectionPanel from '@/components/CorrectionPanel'
import { DEMO_PROJECT } from '@/lib/demo-data'
import { setSession } from '@/lib/analysis-session'
import type { DriftZone } from '@/lib/database.types'

interface AnalysisResult {
  score: number
  zones: DriftZone[]
  featuresFound: number
}

export default function AnalyzePage() {
  const router = useRouter()
  const [spec, setSpec]             = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [result, setResult]         = useState<AnalysisResult | null>(null)
  const [selectedZone, setSelectedZone] = useState<DriftZone | null>(null)
  const [panelOpen, setPanelOpen]       = useState(false)
  const [projectName, setProjectName] = useState('')
  const [saving, setSaving]         = useState(false)
  const [savedId, setSavedId]       = useState<string | null>(null)
  const [saveError, setSaveError]   = useState<string | null>(null)

  async function handleAnalyze() {
    setError(null)
    setResult(null)
    setSavedId(null)
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec_content: spec }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed'); return }
      const zones: DriftZone[] = data.zones.map((z: DriftZone & { drift_type: string }) => ({
        ...z,
        project_id: 'analyze',
        created_at: new Date().toISOString(),
        drift_type: z.drift_type as DriftZone['drift_type'],
      }))
      setResult({ score: data.score, zones, featuresFound: data.featuresFound })

      const ghostCount = zones.filter((z: DriftZone) => z.drift_type === 'ghost').length
      const overbuiltCount = zones.filter((z: DriftZone) => z.drift_type === 'overbuilt').length
      const underbuiltCount = zones.filter((z: DriftZone) => z.drift_type === 'underbuilt').length
      const misunderstoodCount = zones.filter((z: DriftZone) => z.drift_type === 'misunderstood').length
      const alignedCount = zones.filter((z: DriftZone) => z.drift_type === 'aligned').length

      if (typeof pendo !== 'undefined') {
        pendo.track('spec_analysis_completed', {
          driftScore: data.score,
          featuresFound: data.featuresFound,
          zonesCount: zones.length,
          ghostCount,
          overbuiltCount,
          underbuiltCount,
          misunderstoodCount,
          alignedCount,
          specLength: spec.length,
        })
      }
    } catch {
      setError('Network error — is the dev server running?')
    } finally {
      setLoading(false)
    }
  }

  function handleZoneClick(zone: DriftZone) {
    setSelectedZone(zone)
    setPanelOpen(true)
  }

  function storeSession(r: AnalysisResult) {
    setSession({
      spec,
      projectName: projectName.trim() || 'Unsaved Analysis',
      score:        r.score,
      zones:        r.zones,
      featuresFound: r.featuresFound,
      createdAt:    new Date().toISOString(),
    })
  }

  function handleViewInGhost() {
    if (!result) return
    if (savedId) { router.push(`/ghost/${savedId}`); return }
    storeSession(result)
    router.push('/ghost/session')
  }

  function handleViewReport() {
    if (!result) return
    if (savedId) { router.push(`/report/${savedId}`); return }
    storeSession(result)
    router.push('/report/session')
  }

  async function handleSave() {
    if (!result) return
    setSaveError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         projectName.trim() || undefined,
          spec_content: spec,
          drift_score:  result.score,
          zones:        result.zones,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error ?? 'Save failed'); return }
      setSavedId(data.project_id)

      if (typeof pendo !== 'undefined') {
        pendo.track('analysis_saved_to_dashboard', {
          projectName: projectName.trim() || 'Unnamed',
          driftScore: result.score,
          zonesCount: result.zones.length,
          specSource: 'analyze_page',
          saveSource: 'analyze_page',
          featuresFound: result.featuresFound,
        })
      }
    } catch {
      setSaveError('Network error — could not save')
    } finally {
      setSaving(false)
    }
  }

  function loadDemo() {
    setSpec(DEMO_PROJECT.spec_content ?? '')
    setError(null)
    setResult(null)
    setSavedId(null)

    if (typeof pendo !== 'undefined') {
      pendo.track('demo_spec_loaded', {
        demoProjectName: DEMO_PROJECT.name ?? 'TaskFlow Pro',
        specLength: (DEMO_PROJECT.spec_content ?? '').length,
      })
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 flex items-center gap-4 border-b border-slate-700/60 bg-slate-950 px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-slate-700">|</span>
        <span className="text-sm font-bold text-[#FF8A1F]">DRIFT</span>
        <span className="text-sm text-slate-500">/ Analyze</span>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Analyze Your Spec</h1>
          <p className="mb-10 text-slate-400">
            Paste a product spec or PRD and get an instant Drift Score with visual zone breakdown.
          </p>

          <div className="border border-slate-700/60 bg-slate-900 p-6 shadow-lg shadow-black/40">
            <textarea
              value={spec}
              onChange={e => setSpec(e.target.value)}
              rows={10}
              placeholder={'Paste your PRD, README, feature list, roadmap, or product specification...\n\nTip: include lines like "Feature: Dashboard (MUST HAVE)" or "- CSV export (MVP)" for best detection.'}
              className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-950/60 p-4 font-mono text-sm text-slate-300 placeholder-slate-600 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={loadDemo} className="flex items-center gap-2 rounded-lg border border-slate-700/60 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-white">
                <Sparkles className="h-3.5 w-3.5" /> Load Demo Spec
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading || spec.trim().length < 20}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : 'Analyze →'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="mt-10 space-y-8">

                {/* Score card + unsaved badge */}
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 py-10 shadow-xl shadow-black/30">
                  <DriftScore score={result.score} />
                  <p className="text-xs text-slate-600">
                    {result.featuresFound} feature{result.featuresFound !== 1 ? 's' : ''} detected
                  </p>
                  {!savedId && (
                    <span className="mt-1 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Unsaved Session
                    </span>
                  )}
                  {savedId && (
                    <span className="mt-1 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>

                {/* Explore buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleViewInGhost}
                    className="group flex items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/8 py-4 text-sm font-semibold text-violet-300 shadow-lg shadow-black/20 transition-all duration-200 hover:border-violet-500/60 hover:bg-violet-500/15 hover:text-violet-200"
                  >
                    <Maximize2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    View in Ghost Mode
                  </button>
                  <button
                    onClick={handleViewReport}
                    className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-600/40 bg-slate-800/40 py-4 text-sm font-semibold text-slate-300 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-500/60 hover:bg-slate-800/60 hover:text-white"
                  >
                    <BarChart2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    View Report
                  </button>
                </div>

                {/* Drift zones */}
                <div>
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      Drift Zones — click any zone for AI corrections
                    </p>
                  </div>

                  <DriftGrid zones={result.zones} onZoneClick={handleZoneClick} />

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-700">
                    <Wand2 className="h-3 w-3" /> Powered by GPT-4o-mini via OpenRouter
                  </p>
                </div>

                {/* Save section */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl shadow-black/20">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Save to Dashboard
                  </p>
                  {savedId ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <span className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle className="h-4 w-4" /> Analysis saved to Dashboard
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard"
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-600/60 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-400 hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5" /> View Archive
                        </Link>
                        <Link href={`/report/${savedId}`}
                          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20">
                          <BarChart2 className="h-3.5 w-3.5" /> Open Report
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        placeholder="Analysis name (optional)"
                        className="flex-1 rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-slate-500"
                      />
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-40">
                        {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="h-3.5 w-3.5" /> Save to Dashboard</>}
                      </button>
                    </div>
                  )}
                  {saveError && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />{saveError}
                    </p>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <CorrectionPanel zone={selectedZone} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
