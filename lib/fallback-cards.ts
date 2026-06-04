export interface FallbackCard {
  title: string
  user_story: string
  copy_rewrite: string
  mockup_suggestion: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  driftType: string
}

const FALLBACK_CARDS: FallbackCard[] = [
  {
    title: 'Kill the Dashboard',
    user_story:
      "As a user, I want to export data immediately so that I don't waste time in a dashboard I never use.",
    copy_rewrite:
      "Replace 'Dashboard' nav item with 'Export CSV' button on the homepage.",
    mockup_suggestion: 'Single-button landing page. No navigation. One action.',
    priority: 'critical',
    driftType: 'overbuilt',
  },
  {
    title: 'Onboarding is a Graveyard',
    user_story:
      'As a new user, I want to skip the tutorial and start using the core feature in 10 seconds.',
    copy_rewrite:
      "Change 'Get Started' to 'Skip to [Core Feature]' with a secondary 'Show me around' link.",
    mockup_suggestion: 'Modal with two giant buttons: primary action vs. tour.',
    priority: 'high',
    driftType: 'ghost',
  },
  {
    title: 'You Built a Settings App',
    user_story:
      'As a power user, I want the settings to be invisible until I need them so that the main action stays dominant.',
    copy_rewrite:
      'Move Settings to a gear icon in the top-right corner. Remove it from the main nav.',
    mockup_suggestion: 'Hamburger menu or avatar dropdown for secondary actions.',
    priority: 'medium',
    driftType: 'misunderstood',
  },
]

export function getFallbackCard(driftType: string): FallbackCard {
  return FALLBACK_CARDS.find(c => c.driftType === driftType) ?? FALLBACK_CARDS[0]
}
