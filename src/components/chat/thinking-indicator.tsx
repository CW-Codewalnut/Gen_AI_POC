import { AssistantAvatar } from './assistant-avatar'

/** Shown between sending a prompt and the first streamed token. */
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 animate-in fade-in-0 duration-300" role="status" aria-live="polite">
      <AssistantAvatar active />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-shimmer">Thinking through the layout</span>
        <span className="flex gap-1" aria-hidden>
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1 animate-bounce rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
