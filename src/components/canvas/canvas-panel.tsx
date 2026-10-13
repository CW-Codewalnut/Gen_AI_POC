import { useState } from 'react'
import { AlertTriangle, Braces, CheckCircle2, Eye } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SpecRenderer } from '@/genui/renderer'
import type { RenderUIPart } from '@/lib/chat-types'
import { countComponents, formatDuration, specStatus, type SpecTiming } from '@/lib/spec-utils'
import { cn } from '@/lib/utils'
import { CanvasComposing, CanvasEmpty } from './canvas-states'
import { SpecJson } from './spec-json'

type View = 'preview' | 'spec'

type CanvasPanelProps = {
  part: RenderUIPart | undefined
  /** A prompt is in flight and its UI hasn't started streaming yet. */
  composing: boolean
  timing: SpecTiming | undefined
}

export function CanvasPanel({ part, composing, timing }: CanvasPanelProps) {
  const [view, setView] = useState<View>('preview')
  const status = part ? specStatus(part) : undefined
  const streaming = status === 'streaming'
  const title = part?.input?.title

  return (
    <section className="hidden min-h-0 flex-col bg-canvas lg:flex" aria-label="Canvas">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <TabsList>
            <TabsTrigger value="preview">
              <Eye />
              Preview
            </TabsTrigger>
            <TabsTrigger value="spec">
              <Braces />
              JSON spec
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="min-w-0 truncate text-sm font-medium">{composing ? 'New interface' : title}</div>
        <StatusPill part={composing ? undefined : part} composing={composing} timing={timing} />
      </div>

      <div className="relative min-h-0 flex-1">
        {view === 'spec' && part && !composing ? (
          <SpecJson spec={part.input} streaming={streaming} />
        ) : (
          <div className="h-full overflow-y-auto bg-dots">
            {composing ? (
              <Frame>
                <CanvasComposing />
              </Frame>
            ) : part ? (
              <Frame>
                {status === 'error' && (
                  <Alert className="mb-5 border-amber-500/30 bg-amber-500/5 *:[svg]:text-amber-600">
                    <AlertTriangle />
                    <AlertTitle>Partially rendered</AlertTitle>
                    <AlertDescription>
                      Part of the spec didn't match the component catalog. Everything valid is shown below.
                    </AlertDescription>
                  </Alert>
                )}
                <SpecRenderer specId={part.toolCallId} spec={part.input} streaming={streaming} />
              </Frame>
            ) : (
              <CanvasEmpty />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl p-6 xl:p-8">
      <div className="rounded-2xl border bg-background p-6 shadow-sm xl:p-8">{children}</div>
    </div>
  )
}

function StatusPill({
  part,
  composing,
  timing,
}: {
  part: RenderUIPart | undefined
  composing: boolean
  timing: SpecTiming | undefined
}) {
  if (!part && !composing) return null
  const status = part ? specStatus(part) : 'streaming'
  const count = countComponents(part?.input)

  return (
    <div
      className={cn(
        'ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium',
        status === 'streaming' && 'border-primary/30 bg-primary/5 text-primary',
        status === 'ready' && 'border-success/30 bg-success/5 text-success',
        status === 'error' && 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400',
      )}
      role="status"
      aria-live="polite"
    >
      {status === 'streaming' ? (
        <>
          <Spinner className="size-3.5" />
          {composing || count === 0 ? 'Composing' : `Stitching · ${count} components`}
        </>
      ) : status === 'ready' ? (
        <>
          <CheckCircle2 className="size-3.5" />
          {count} components{timing?.end && ` · ${formatDuration(timing.end - timing.start)}`}
        </>
      ) : (
        <>
          <AlertTriangle className="size-3.5" />
          Rendered with warnings
        </>
      )}
    </div>
  )
}
