import { useMemo, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutoScroll } from '@/hooks/use-auto-scroll'
import type { PartialSpec } from '@/lib/chat-types'
import { cn } from '@/lib/utils'

const TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

/** Minimal JSON syntax highlighting — enough to make the spec readable on a projector. */
function highlight(json: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  for (const match of json.matchAll(TOKEN)) {
    const index = match.index
    if (index > last) nodes.push(json.slice(last, index))
    const [token, str, colon, literal, number] = match
    const className = str
      ? colon
        ? 'text-primary'
        : 'text-emerald-700 dark:text-emerald-400'
      : literal
        ? 'text-fuchsia-700 dark:text-fuchsia-400'
        : number
          ? 'text-amber-700 dark:text-amber-400'
          : undefined
    nodes.push(
      <span key={index} className={className}>
        {str ?? token}
      </span>,
    )
    if (colon) nodes.push(colon)
    last = index + token.length
  }
  nodes.push(json.slice(last))
  return nodes
}

export function SpecJson({ spec, streaming }: { spec: PartialSpec | undefined; streaming: boolean }) {
  const json = useMemo(() => JSON.stringify(spec ?? {}, null, 2), [spec])
  const highlighted = useMemo(() => highlight(json), [json])
  const { ref, onScroll } = useAutoScroll<HTMLDivElement>(streaming ? json : null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked outside secure contexts; nothing else to do.
    }
  }

  return (
    <div className="relative h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={copy}
        className="absolute top-3 right-5 z-10 bg-background"
        disabled={!spec}
      >
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? 'Copied' : 'Copy JSON'}
      </Button>
      <div ref={ref} onScroll={onScroll} className="h-full overflow-auto bg-background">
        <pre
          className={cn(
            'p-5 font-mono text-xs/relaxed text-muted-foreground',
            streaming && 'streaming-caret',
          )}
        >
          {highlighted}
        </pre>
      </div>
    </div>
  )
}
