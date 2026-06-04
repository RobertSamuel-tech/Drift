// ─── DRIFT Design System ─────────────────────────────────────────────────────
// Shared tokens for a premium, venture-backed SaaS aesthetic.
// Palette: slate-950/900 backgrounds · white/slate-300 text
// Accents: emerald (success) · amber (warning) · red (critical) · violet (drift)
// No neon, no hacker aesthetics, no purple themes.

// ─── Panel styles ─────────────────────────────────────────────────────────────
export const panel = {
  // Standard glass panel — most cards and sections
  base: [
    'rounded-2xl border border-slate-700/50',
    'bg-slate-900/60 backdrop-blur-md',
    'shadow-xl shadow-black/30',
  ].join(' '),

  // Elevated — hero sections, primary focus areas
  elevated: [
    'rounded-2xl border border-slate-700/40',
    'bg-slate-900/70 backdrop-blur-lg',
    'shadow-2xl shadow-black/50',
  ].join(' '),

  // Inset — inner cards, nested surfaces
  inset: [
    'rounded-xl border border-slate-800/60',
    'bg-slate-950/60 backdrop-blur-sm',
    'shadow-sm shadow-black/20',
  ].join(' '),

  // Hero — full-width report sections
  hero: [
    'rounded-3xl border border-slate-700/40',
    'bg-slate-900/50 backdrop-blur-xl',
    'shadow-2xl shadow-black/50',
  ].join(' '),

  // Interactive — clickable cards, hover state included
  interactive: [
    'rounded-2xl border border-slate-700/50',
    'bg-slate-900/60 backdrop-blur-md',
    'shadow-xl shadow-black/30',
    'transition-all duration-200',
    'hover:border-slate-600/60 hover:bg-slate-800/60 hover:shadow-2xl hover:shadow-black/50',
    'hover:-translate-y-0.5',
  ].join(' '),
} as const

// ─── Metric card styles ───────────────────────────────────────────────────────
export const metric = {
  // Large KPI number (e.g., drift score, alignment index)
  value: 'text-5xl font-black tabular-nums tracking-tight leading-none',

  // Medium stat (e.g., ghost count, sprint count)
  valueMd: 'text-2xl font-black tabular-nums tracking-tight',

  // Small inline stat
  valueSm: 'text-xl font-black tabular-nums',

  // Section label above a metric
  label: 'text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500',

  // Sub-label below a metric
  sublabel: 'text-xs text-slate-600',

  // Metric card container
  card: [
    'rounded-xl border border-slate-700/50',
    'bg-slate-900/60 backdrop-blur-sm',
    'px-4 py-3',
    'shadow-md shadow-black/20',
  ].join(' '),
} as const

// ─── Badge styles ─────────────────────────────────────────────────────────────
export const badge = {
  // Priority badges
  priority: {
    high:   'bg-red-500/15    text-red-400    ring-1 ring-inset ring-red-500/25',
    medium: 'bg-amber-500/15  text-amber-400  ring-1 ring-inset ring-amber-500/25',
    low:    'bg-slate-700/50  text-slate-400  ring-1 ring-inset ring-slate-600/40',
  },

  // Drift type badges
  drift: {
    ghost:         'bg-slate-800/60   text-slate-400   ring-1 ring-inset ring-slate-700/50',
    overbuilt:     'bg-red-500/15     text-red-400     ring-1 ring-inset ring-red-500/25',
    underbuilt:    'bg-amber-500/15   text-amber-400   ring-1 ring-inset ring-amber-500/25',
    misunderstood: 'bg-violet-500/15  text-violet-400  ring-1 ring-inset ring-violet-500/25',
    aligned:       'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  },

  // Status / severity badges
  severity: {
    critical: 'bg-red-500/15    text-red-400    ring-1 ring-red-500/25',
    high:     'bg-amber-500/15  text-amber-400  ring-1 ring-amber-500/25',
    medium:   'bg-blue-500/15   text-blue-400   ring-1 ring-blue-500/25',
    low:      'bg-slate-700/50  text-slate-400  ring-1 ring-slate-600/40',
  },

  // Base shape — wrap around any badge variant above
  base: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
} as const

// ─── Color tokens ─────────────────────────────────────────────────────────────
export const color = {
  bg: {
    base:     'bg-slate-950',
    surface:  'bg-slate-900',
    elevated: 'bg-slate-800',
  },
  text: {
    primary:   'text-white',
    secondary: 'text-slate-300',
    muted:     'text-slate-500',
    faint:     'text-slate-600',
  },
  border: {
    faint:   'border-slate-800/60',
    default: 'border-slate-700/50',
    strong:  'border-slate-600/60',
  },
  accent: {
    success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', stroke: '#10b981' },
    warning: { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  stroke: '#f59e0b' },
    danger:  { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',    stroke: '#ef4444' },
    drift:   { text: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20', stroke: '#8b5cf6' },
  },
} as const

// ─── Score helpers (Drift Score + Alignment Index) ────────────────────────────
export const scoreTheme = {
  color:  (s: number) => s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400',
  border: (s: number) => s >= 80 ? 'border-emerald-500/20' : s >= 50 ? 'border-amber-500/20' : 'border-red-500/20',
  stroke: (s: number) => s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444',
  shadow: (s: number) => s >= 80
    ? 'shadow-[0_0_48px_-8px_rgba(16,185,129,0.18)]'
    : s >= 50
    ? 'shadow-[0_0_48px_-8px_rgba(245,158,11,0.18)]'
    : 'shadow-[0_0_48px_-8px_rgba(239,68,68,0.18)]',
} as const

// ─── Framer Motion animation presets ─────────────────────────────────────────
export const spring = {
  // Snappy for metric reveals and counter animations
  reveal: { type: 'spring' as const, stiffness: 320, damping: 32 },

  // Smooth for large panel entrances
  panel: { type: 'spring' as const, stiffness: 220, damping: 26 },

  // Gentle for subtle state changes
  gentle: { type: 'spring' as const, stiffness: 160, damping: 22 },

  // Quick for hover/tap feedback
  hover: { type: 'spring' as const, stiffness: 420, damping: 32 },
} as const

// ─── Shared motion variants ───────────────────────────────────────────────────
export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden:  { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden:  { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden:  { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
} as const
