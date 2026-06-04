// ─── DRIFT Command-Center Design System ──────────────────────────────────────
// Operational intelligence aesthetic — dense panels, mono labels, sharp edges.
// Structurally translated from cyberpunk-dashboard-design reference patterns.
// Palette unchanged: slate-950/900/800 · emerald · amber · red · violet.
// NO neon, NO orange, NO gaming aesthetics.

// ─── Panel styles ─────────────────────────────────────────────────────────────
export const panel = {
  // Standard intelligence panel — sharp, dense
  base: 'bg-slate-900 border border-slate-700/60',

  // Elevated — primary focus area
  elevated: 'bg-slate-900 border border-slate-600/60 shadow-lg shadow-black/40',

  // Inset — nested data surface
  inset: 'bg-slate-800/60 border border-slate-700/40',

  // Left-accent — section emphasis with emerald bar
  accent: 'border-l-2 border-emerald-500/70 bg-slate-950/60',

  // Left-accent danger
  accentDanger: 'border-l-2 border-red-500/70 bg-slate-950/60',

  // Left-accent warning
  accentWarn: 'border-l-2 border-amber-500/70 bg-slate-950/60',

  // Interactive list row
  row: 'border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors duration-150',

  // Panel header bar
  header: 'border-b border-slate-800/60 px-4 py-2 flex items-center gap-2',

  // Full opaque shell
  shell: 'bg-slate-950 border border-slate-700/60',
} as const

// ─── Typography — command-center mono-first ───────────────────────────────────
export const type = {
  // Panel section label (PRODUCT INTENT, DRIFT ANALYSIS, USER REALITY)
  panelHeader: 'font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500',

  // Inline field key
  label: 'font-mono text-[9px] uppercase tracking-widest text-slate-600',

  // Monospace data values
  mono:       'font-mono tabular-nums text-white',
  monoMuted:  'font-mono tabular-nums text-slate-400',
  monoFaint:  'font-mono tabular-nums text-slate-600',

  // Large KPI display
  metric:   'font-mono text-2xl font-bold tabular-nums leading-none',
  metricLg: 'font-mono text-4xl font-black tabular-nums leading-none',
  metricXl: 'font-mono text-6xl font-black tabular-nums leading-none',
} as const

// ─── Metric card — compact intelligence readout ───────────────────────────────
export const metric = {
  card:     'bg-slate-900 border border-slate-700/60 px-4 py-3 shadow-md shadow-black/20',
  value:    'font-mono text-xl font-bold tabular-nums leading-none',
  valueMd:  'font-mono text-2xl font-bold tabular-nums leading-none',
  label:    'font-mono text-[9px] uppercase tracking-widest text-slate-600 mt-1',
} as const

// ─── Badge styles ─────────────────────────────────────────────────────────────
export const badge = {
  priority: {
    high:   'bg-red-500/15    text-red-400    ring-1 ring-inset ring-red-500/25',
    medium: 'bg-amber-500/15  text-amber-400  ring-1 ring-inset ring-amber-500/25',
    low:    'bg-slate-700/50  text-slate-400  ring-1 ring-inset ring-slate-600/40',
  },
  drift: {
    ghost:         'bg-slate-800/60   text-slate-400   ring-1 ring-inset ring-slate-700/50',
    overbuilt:     'bg-red-500/15     text-red-400     ring-1 ring-inset ring-red-500/25',
    underbuilt:    'bg-amber-500/15   text-amber-400   ring-1 ring-inset ring-amber-500/25',
    misunderstood: 'bg-violet-500/15  text-violet-400  ring-1 ring-inset ring-violet-500/25',
    aligned:       'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  },
  severity: {
    critical: 'bg-red-500/15    text-red-400    ring-1 ring-red-500/25',
    high:     'bg-amber-500/15  text-amber-400  ring-1 ring-amber-500/25',
    medium:   'bg-blue-500/15   text-blue-400   ring-1 ring-blue-500/25',
    low:      'bg-slate-700/50  text-slate-400  ring-1 ring-slate-600/40',
  },
  base: 'px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
} as const

// ─── Score helpers ────────────────────────────────────────────────────────────
export const scoreTheme = {
  color:  (s: number) => s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400',
  border: (s: number) => s >= 80 ? 'border-emerald-500/30' : s >= 50 ? 'border-amber-500/30' : 'border-red-500/30',
  accentL:(s: number) => s >= 80 ? 'border-l-2 border-emerald-500' : s >= 50 ? 'border-l-2 border-amber-500' : 'border-l-2 border-red-500',
  stroke: (s: number) => s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444',
  shadow: (s: number) => s >= 80
    ? 'shadow-[0_0_32px_-8px_rgba(16,185,129,0.15)]'
    : s >= 50
    ? 'shadow-[0_0_32px_-8px_rgba(245,158,11,0.15)]'
    : 'shadow-[0_0_32px_-8px_rgba(239,68,68,0.15)]',
} as const

// ─── Color tokens ─────────────────────────────────────────────────────────────
export const color = {
  bg:     { base: 'bg-slate-950', surface: 'bg-slate-900', elevated: 'bg-slate-800' },
  text:   { primary: 'text-white', secondary: 'text-slate-300', muted: 'text-slate-500', faint: 'text-slate-600' },
  border: { faint: 'border-slate-800/60', default: 'border-slate-700/60', strong: 'border-slate-600/60' },
  accent: {
    success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', stroke: '#10b981' },
    warning: { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',  stroke: '#f59e0b' },
    danger:  { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',    stroke: '#ef4444' },
    drift:   { text: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30', stroke: '#8b5cf6' },
  },
} as const

// ─── Framer Motion presets ────────────────────────────────────────────────────
export const spring = {
  reveal: { type: 'spring' as const, stiffness: 320, damping: 32 },
  panel:  { type: 'spring' as const, stiffness: 220, damping: 26 },
  gentle: { type: 'spring' as const, stiffness: 160, damping: 22 },
  hover:  { type: 'spring' as const, stiffness: 420, damping: 32 },
} as const

export const variants = {
  fadeUp:     { hidden: { opacity: 0, y: 16 },  visible: { opacity: 1, y: 0 } },
  fadeDown:   { hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 } },
  slideLeft:  { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: 28 },  visible: { opacity: 1, x: 0 } },
  scaleIn:    { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
} as const
