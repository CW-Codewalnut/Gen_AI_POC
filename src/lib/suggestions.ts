import {
  Activity,
  BarChart3,
  Briefcase,
  CreditCard,
  Plane,
  Siren,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

export type PromptSuggestion = {
  title: string
  prompt: string
  icon: LucideIcon
}

/** Demo prompts chosen to show off different parts of the component catalog. */
export const SUGGESTIONS: PromptSuggestion[] = [
  {
    title: 'SaaS revenue dashboard',
    prompt:
      'Build a Q3 revenue dashboard for a B2B SaaS company with KPI cards, a monthly MRR trend, revenue by plan, and a table of top accounts.',
    icon: BarChart3,
  },
  {
    title: 'Trip planner',
    prompt:
      'Plan a 3-day trip to Kyoto in November with a day-by-day itinerary, a budget breakdown, and hotel options I can choose from.',
    icon: Plane,
  },
  {
    title: 'Pricing comparison',
    prompt:
      'Compare Starter, Pro, and Enterprise plans for a project management tool and let me pick one with a monthly/annual toggle.',
    icon: CreditCard,
  },
  {
    title: 'Job application form',
    prompt: 'Create a job application form for a Senior React Engineer role at CodeWalnut.',
    icon: Briefcase,
  },
  {
    title: 'Incident status page',
    prompt:
      'Show a live incident status page for a payment API outage: impact summary, affected services, uptime chart, and an incident timeline.',
    icon: Siren,
  },
  {
    title: 'Sprint overview',
    prompt:
      'Summarize our current sprint for a 6-person team: progress, tasks by status, blockers, and workload per engineer.',
    icon: Target,
  },
  {
    title: 'Fitness summary',
    prompt: 'Show my weekly fitness summary with steps, workouts, a sleep trend, and progress towards my goals.',
    icon: Activity,
  },
  {
    title: 'Restaurant booking',
    prompt: 'Help me book a table for 4 at an Italian restaurant in Bangalore this Saturday evening.',
    icon: UtensilsCrossed,
  },
]
