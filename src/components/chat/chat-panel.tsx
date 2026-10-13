import { AlertCircle, RotateCcw } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAutoScroll } from '@/hooks/use-auto-scroll'
import type { GenUIMessage } from '@/lib/chat-types'
import type { SpecTiming } from '@/lib/spec-utils'
import { AssistantAvatar } from './assistant-avatar'
import { MessageItem } from './message-item'
import { PromptInput } from './prompt-input'
import { SuggestionList } from './suggestion-list'
import { ThinkingIndicator } from './thinking-indicator'

type ChatPanelProps = {
  messages: GenUIMessage[]
  busy: boolean
  /** True after sending, until the assistant's first visible output arrives. */
  thinking: boolean
  error: Error | undefined
  selectedSpecId: string | undefined
  timings: ReadonlyMap<string, SpecTiming>
  onSend: (text: string) => void
  onStop: () => void
  onRetry: () => void
  onSelectSpec: (toolCallId: string) => void
}

export function ChatPanel({
  messages,
  busy,
  thinking,
  error,
  selectedSpecId,
  timings,
  onSend,
  onStop,
  onRetry,
  onSelectSpec,
}: ChatPanelProps) {
  const empty = messages.length === 0
  const { ref, onScroll, pin } = useAutoScroll<HTMLDivElement>(messages, !empty)
  const last = messages.at(-1)

  const send = (text: string) => {
    pin()
    onSend(text)
  }

  return (
    <section className="flex min-h-0 flex-col bg-background lg:border-r" aria-label="Chat">
      <div ref={ref} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <Welcome onPick={send} busy={busy} />
        ) : (
          <div className="flex flex-col gap-5 p-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                streaming={busy && message === last && message.role === 'assistant'}
                selectedSpecId={selectedSpecId}
                timings={timings}
                onSelectSpec={onSelectSpec}
              />
            ))}
            {thinking && <ThinkingIndicator />}
            {error && <ErrorNotice error={error} onRetry={onRetry} />}
          </div>
        )}
      </div>
      <PromptInput busy={busy} showSuggestionTray={!empty} onSend={send} onStop={onStop} />
    </section>
  )
}

function Welcome({ onPick, busy }: { onPick: (prompt: string) => void; busy: boolean }) {
  return (
    <div className="flex flex-col gap-5 p-4 pt-6">
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold tracking-tight">Describe an interface. Watch it assemble.</h2>
          <p className="text-sm text-pretty text-muted-foreground">
            Claude composes a UI from a catalog of shadcn components and streams it to the canvas in real time.
            Try one of these:
          </p>
        </div>
      </div>
      <SuggestionList variant="cards" disabled={busy} onPick={(suggestion) => onPick(suggestion.prompt)} />
    </div>
  )
}

/** The server returns `{ error }` JSON for setup problems; streamed errors arrive as plain text. */
function readableError(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: string }
    if (parsed.error) return parsed.error
  } catch {
    // Not JSON — use as-is.
  }
  return error.message || 'Something went wrong.'
}

function ErrorNotice({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert className="border-critical/30 bg-critical/5 *:[svg]:text-critical">
      <AlertCircle />
      <AlertTitle>Couldn't generate the UI</AlertTitle>
      <AlertDescription>{readableError(error)}</AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline" onClick={onRetry}>
          <RotateCcw data-icon="inline-start" />
          Retry
        </Button>
      </AlertAction>
    </Alert>
  )
}
