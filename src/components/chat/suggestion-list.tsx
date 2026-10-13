import { ArrowUpRight } from 'lucide-react'
import { SUGGESTIONS, type PromptSuggestion } from '@/lib/suggestions'
import { cn } from '@/lib/utils'

type SuggestionListProps = {
  onPick: (suggestion: PromptSuggestion) => void
  disabled?: boolean
  /** "cards" for the empty chat, "chips" for the compact tray above the input. */
  variant: 'cards' | 'chips'
}

export function SuggestionList({ onPick, disabled, variant }: SuggestionListProps) {
  if (variant === 'chips') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            disabled={disabled}
            onClick={() => onPick(suggestion)}
            title={suggestion.prompt}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
          >
            <suggestion.icon className="size-3.5" />
            {suggestion.title}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {SUGGESTIONS.map((suggestion, index) => (
        <button
          key={suggestion.title}
          type="button"
          disabled={disabled}
          onClick={() => onPick(suggestion)}
          style={{ animationDelay: `${index * 40}ms` }}
          className={cn(
            'group flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-all animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500',
            'hover:border-primary/40 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <suggestion.icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2 text-sm font-medium">
              {suggestion.title}
              <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="mt-0.5 line-clamp-2 text-xs/relaxed text-muted-foreground">{suggestion.prompt}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
