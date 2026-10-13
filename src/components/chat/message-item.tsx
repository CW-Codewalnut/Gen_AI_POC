import { SpecRenderer } from '@/genui/renderer'
import { isRenderUIPart, type GenUIMessage } from '@/lib/chat-types'
import type { SpecTiming } from '@/lib/spec-utils'
import { cn } from '@/lib/utils'
import { AssistantAvatar } from './assistant-avatar'
import { SpecChip } from './spec-chip'

type MessageItemProps = {
  message: GenUIMessage
  /** True for the assistant message that is currently streaming. */
  streaming: boolean
  selectedSpecId: string | undefined
  timings: ReadonlyMap<string, SpecTiming>
  onSelectSpec: (toolCallId: string) => void
}

export function MessageItem({
  message,
  streaming,
  selectedSpecId,
  timings,
  onSelectSpec,
}: MessageItemProps) {
  if (message.role === 'user') {
    const text = message.parts.map((part) => (part.type === 'text' ? part.text : '')).join('')
    return (
      <div className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm/relaxed whitespace-pre-wrap text-primary-foreground">
          {text}
        </div>
      </div>
    )
  }

  const lastPartIndex = message.parts.length - 1

  return (
    <div className="flex gap-3 animate-in fade-in-0 duration-300">
      <AssistantAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-0.5">
        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            if (!part.text.trim()) return null
            return (
              <p
                key={index}
                className={cn(
                  'text-sm/relaxed whitespace-pre-wrap',
                  streaming && index === lastPartIndex && part.state === 'streaming' && 'streaming-caret',
                )}
              >
                {part.text}
              </p>
            )
          }

          if (isRenderUIPart(part)) {
            const specStreaming = part.state === 'input-streaming'
            return (
              <div key={part.toolCallId} className="flex flex-col gap-3">
                <SpecChip
                  part={part}
                  timing={timings.get(part.toolCallId)}
                  selected={selectedSpecId === part.toolCallId}
                  onSelect={() => onSelectSpec(part.toolCallId)}
                />
                {/* Narrow screens have no canvas, so the UI renders inline. */}
                <div className="rounded-xl border bg-canvas p-3 lg:hidden">
                  <SpecRenderer specId={part.toolCallId} spec={part.input} streaming={specStreaming} />
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
