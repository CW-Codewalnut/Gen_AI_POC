import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp, Lightbulb, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SuggestionList } from './suggestion-list'

type PromptInputProps = {
  busy: boolean
  /** The empty chat shows suggestions as cards, so the tray isn't needed there. */
  showSuggestionTray: boolean
  onSend: (text: string) => void
  onStop: () => void
}

export function PromptInput({ busy, showSuggestionTray, onSend, onStop }: PromptInputProps) {
  const [value, setValue] = useState('')
  const [trayOpen, setTrayOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Grow with the content up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = value.trim()
    if (!text || busy) return
    onSend(text)
    setValue('')
    setTrayOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event)
  }

  return (
    <div className="shrink-0 border-t bg-background p-3">
      {showSuggestionTray && trayOpen && (
        <div className="mb-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
          <SuggestionList
            variant="chips"
            disabled={busy}
            onPick={(suggestion) => {
              onSend(suggestion.prompt)
              setTrayOpen(false)
            }}
          />
        </div>
      )}

      <form
        onSubmit={submit}
        className="rounded-2xl border bg-card shadow-xs transition-shadow focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe the interface you want to see…"
          aria-label="Prompt"
          className="block max-h-40 w-full resize-none bg-transparent px-3.5 pt-3 pb-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 p-2">
          {showSuggestionTray ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTrayOpen((open) => !open)}
              className={cn('text-muted-foreground', trayOpen && 'text-foreground')}
            >
              {trayOpen ? <X data-icon="inline-start" /> : <Lightbulb data-icon="inline-start" />}
              Suggestions
            </Button>
          ) : (
            <span className="pl-1.5 text-xs text-muted-foreground">
              <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift + Enter</kbd> new line
            </span>
          )}

          {busy ? (
            <Button type="button" size="icon" variant="secondary" onClick={onStop} aria-label="Stop generating">
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim()}
              aria-label="Send"
              className="bg-brand-gradient text-white hover:opacity-90 disabled:bg-none disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUp />
            </Button>
          )}
        </div>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Claude composes a JSON UI spec · rendered live with shadcn/ui
      </p>
    </div>
  )
}
