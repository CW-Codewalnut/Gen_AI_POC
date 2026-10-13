import { tool } from 'ai'
import { uiSpecSchema, type RenderUIOutput } from '../../../shared/ui-spec.js'

/**
 * Method 3 — JSON UI spec. Claude composes an interface from the catalog in
 * shared/ui-spec.ts; the browser renders it while the tool input streams in.
 *
 * Nothing runs on the server: the spec *is* the result. `execute` only returns
 * a small acknowledgement so the conversation history stays valid for the
 * next turn (every tool call needs a matching tool result).
 */
export const renderUI = tool({
  description:
    'Render an interactive interface for the user, composed from the component catalog. Call this to answer almost every request.',
  inputSchema: uiSpecSchema,
  execute: async ({ components }): Promise<RenderUIOutput> => ({
    status: 'rendered',
    componentCount: components.length,
  }),
})
