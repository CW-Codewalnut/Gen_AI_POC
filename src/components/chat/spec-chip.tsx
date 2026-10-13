import { AlertTriangle, ChevronRight, LayoutDashboard } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import type { RenderUIPart } from '@/lib/chat-types'
import { countComponents, formatDuration, specStatus, type SpecTiming } from '@/lib/spec-utils'
import { cn } from '@/lib/utils'

type SpecChipProps = {
  part: RenderUIPart
  timing: SpecTiming | undefined
  selected: boolean
  onSelect: () => void
}

/** Compact card in the chat that represents one generated UI; selects it on the canvas. */
export function SpecChip({ part, timing, selected, onSelect }: SpecChipProps) {
  const status = specStatus(part)
  const count = countComponents(part.input)
  const title = part.input?.title

  const subtitle =
    status === 'streaming' ? (
      <span className="text-shimmer">
        Stitching components{count > 0 && ` · ${count}`}
      </span>
    ) : status === 'error' ? (
      <span>Rendered with warnings · {count} components</span>
    ) : (
      <span>
        {count} components{timing?.end && ` · ${formatDuration(timing.end - timing.start)}`}
      </span>
    )

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border bg-card p-3 text-left transition-all',
        'hover:border-primary/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
        selected && 'border-primary/50 ring-2 ring-primary/15',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg',
            status === 'error' ? 'bg-amber-500/15 text-amber-600' : 'bg-primary/10 text-primary',
          )}
        >
          {status === 'streaming' ? (
            <Spinner />
          ) : status === 'error' ? (
            <AlertTriangle className="size-4" />
          ) : (
            <LayoutDashboard className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title || 'Composing interface…'}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <ChevronRight
          className={cn(
            'hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 lg:block',
            status === 'streaming' && 'lg:hidden',
          )}
        />
      </div>
      {status === 'streaming' && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-primary/10" aria-hidden>
          <div className="h-full w-1/3 animate-[indeterminate_1.4s_ease-in-out_infinite] bg-brand-gradient" />
        </div>
      )}
    </button>
  )
}
