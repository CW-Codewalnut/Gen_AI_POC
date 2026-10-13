import type { DeepPartial, UIDataTypes, UIMessage } from 'ai'
import type { RenderUIOutput, UISpec } from '@shared/ui-spec'

/**
 * Client-side view of the server's tool registry (server/agent/tools).
 * Declared by hand so the browser bundle never imports server code.
 * Method 2 tools get an entry here when they are added.
 */
export type GenUITools = {
  renderUI: { input: UISpec; output: RenderUIOutput }
}

export type GenUIMetadata = { model?: string }

export type GenUIMessage = UIMessage<GenUIMetadata, UIDataTypes, GenUITools>

export type GenUIPart = GenUIMessage['parts'][number]

export type RenderUIPart = Extract<GenUIPart, { type: 'tool-renderUI' }>

/** A spec as it exists mid-stream: any field may still be missing. */
export type PartialSpec = DeepPartial<UISpec>

export function isRenderUIPart(part: GenUIPart): part is RenderUIPart {
  return part.type === 'tool-renderUI'
}

export function isSpecStreaming(part: RenderUIPart) {
  return part.state === 'input-streaming'
}
