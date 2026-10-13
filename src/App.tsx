import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { CanvasPanel } from '@/components/canvas/canvas-panel'
import { ChatPanel } from '@/components/chat/chat-panel'
import { AppHeader } from '@/components/layout/app-header'
import { useHealth } from '@/hooks/use-health'
import { useGenUIStore } from '@/genui/store'
import { useTheme } from '@/hooks/use-theme'
import { isRenderUIPart, type GenUIMessage, type RenderUIPart } from '@/lib/chat-types'
import type { SpecTiming } from '@/lib/spec-utils'

const transport = new DefaultChatTransport<GenUIMessage>({ api: '/api/chat' })

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const health = useHealth()

  const sentAt = useRef(0)
  const [timings, setTimings] = useState<ReadonlyMap<string, SpecTiming>>(() => new Map())

  const { messages, sendMessage, status, stop, error, regenerate, setMessages, clearError } = useChat<GenUIMessage>({
    transport,
    // Batch UI updates while the spec streams; keeps charts smooth.
    throttle: 50,
    // Record how long each generated UI took, from prompt sent to spec complete.
    onFinish: ({ message }) => {
      const end = performance.now()
      setTimings((prev) => {
        const next = new Map(prev)
        for (const part of message.parts) {
          if (isRenderUIPart(part) && !next.has(part.toolCallId)) {
            next.set(part.toolCallId, { start: sentAt.current, end })
          }
        }
        return next
      })
    },
  })

  const busy = status === 'submitted' || status === 'streaming'
  const [selectedSpecId, setSelectedSpecId] = useState<string>()

  const specParts = useMemo(
    () => messages.flatMap((message) => (message.role === 'assistant' ? message.parts.filter(isRenderUIPart) : [])),
    [messages],
  )

  // The current turn is "composing" until its first renderUI part appears.
  const last = messages.at(-1)
  const turnHasSpec = last?.role === 'assistant' && last.parts.some(isRenderUIPart)
  const turnHasOutput = last?.role === 'assistant' && last.parts.some((p) => isRenderUIPart(p) || (p.type === 'text' && p.text.trim()))
  const thinking = busy && !turnHasOutput
  const composing = busy && !turnHasSpec

  const selectedPart = selectedSpecId ? specParts.find((part) => part.toolCallId === selectedSpecId) : undefined
  const activePart: RenderUIPart | undefined = selectedPart ?? (composing ? undefined : specParts.at(-1))

  const send = useCallback(
    (text: string) => {
      if (busy) return
      clearError()
      setSelectedSpecId(undefined)
      sentAt.current = performance.now()
      void sendMessage({ text })
    },
    [busy, clearError, sendMessage],
  )

  // Generated buttons read these from the GenUI store.
  useEffect(() => {
    useGenUIStore.setState({ busy, sendMessage: send })
  }, [busy, send])

  const retry = useCallback(() => {
    sentAt.current = performance.now()
    void regenerate()
  }, [regenerate])

  const newChat = useCallback(() => {
    void stop()
    setMessages([])
    clearError()
    setSelectedSpecId(undefined)
    useGenUIStore.getState().reset()
  }, [clearError, setMessages, stop])

  return (
    <div className="flex h-dvh flex-col">
      <AppHeader
        health={health}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewChat={newChat}
        canReset={messages.length > 0}
      />
      <main className="grid min-h-0 flex-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr]">
        <ChatPanel
          messages={messages}
          busy={busy}
          thinking={thinking}
          error={error}
          selectedSpecId={activePart?.toolCallId}
          timings={timings}
          onSend={send}
          onStop={() => void stop()}
          onRetry={retry}
          onSelectSpec={setSelectedSpecId}
        />
        <CanvasPanel
          part={activePart}
          composing={composing && !selectedPart}
          timing={activePart ? timings.get(activePart.toolCallId) : undefined}
        />
      </main>
    </div>
  )
}
