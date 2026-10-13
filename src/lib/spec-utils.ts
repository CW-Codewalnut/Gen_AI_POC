import type { PartialSpec, RenderUIPart } from './chat-types'

/** Components that have streamed in far enough to know what they are. */
export function countComponents(spec: PartialSpec | undefined): number {
  return spec?.components?.filter((component) => component?.type && component.id).length ?? 0
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`
}

export type SpecStatus = 'streaming' | 'ready' | 'error'

export function specStatus(part: RenderUIPart): SpecStatus {
  if (part.state === 'output-error') return 'error'
  if (part.state === 'input-streaming') return 'streaming'
  return 'ready'
}

/** Stream timing per tool call: start = when the prompt was sent, end = spec complete. */
export type SpecTiming = { start: number; end?: number }
