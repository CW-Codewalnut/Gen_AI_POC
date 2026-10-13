import { Moon, Plus, Sun } from 'lucide-react'
import { CodeWalnutLogo } from '@/components/brand/codewalnut-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Health } from '@/hooks/use-health'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  health: Health
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onNewChat: () => void
  canReset: boolean
}

export function AppHeader({ health, theme, onToggleTheme, onNewChat, canReset }: AppHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" aria-hidden />

      <CodeWalnutLogo className="h-7 shrink-0" />
      <div className="h-5 w-px bg-border" aria-hidden />
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-sm font-semibold tracking-tight">Generative UI Studio</h1>
        <Badge variant="outline" className="hidden text-muted-foreground sm:inline-flex">
          POC · JSON UI spec
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ModelStatus health={health} />
        <Button variant="ghost" size="sm" onClick={onNewChat} disabled={!canReset}>
          <Plus data-icon="inline-start" />
          <span className="hidden sm:inline">New chat</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  )
}

function ModelStatus({ health }: { health: Health }) {
  const { dot, label, hint } =
    health.state === 'loading'
      ? { dot: 'bg-muted-foreground/40', label: 'Connecting…', hint: 'Contacting the AI server' }
      : health.state === 'offline'
        ? { dot: 'bg-critical', label: 'Server offline', hint: 'Start it with npm run dev' }
        : !health.configured
          ? { dot: 'bg-amber-500', label: 'API key missing', hint: 'Add ANTHROPIC_API_KEY to .env and restart' }
          : { dot: 'bg-success', label: health.model, hint: `Anthropic · effort: ${health.effort}` }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden h-7 items-center gap-2 rounded-full border bg-muted/40 px-2.5 text-xs font-medium md:flex">
          <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />
          <span className="font-mono">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
