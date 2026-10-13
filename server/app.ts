import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  validateUIMessages,
} from 'ai'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { buildInstructions } from './agent/instructions.js'
import { anthropicOptions, EFFORT, MAX_OUTPUT_TOKENS, model, MODEL_ID } from './agent/model.js'
import { tools } from './agent/tools/index.js'

/**
 * The /api routes, shared by every host:
 *   - server/index.ts  runs it as a long-lived Node server (local dev, Render)
 *   - api/index.ts     runs it as a Vercel Function
 */
export const app = new Hono()
app.use('/api/*', logger())

app.get('/api/health', (c) =>
  c.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY), model: MODEL_ID, effort: EFFORT }),
)

app.post('/api/chat', async (c) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    const error =
      'ANTHROPIC_API_KEY is not set. Add it to .env locally, or to your host’s environment variables, then restart or redeploy.'
    return c.json({ error }, 500)
  }

  const body = await c.req.json<{ messages: unknown }>()
  const messages = await validateUIMessages({ messages: body.messages })

  const result = streamText({
    model,
    instructions: buildInstructions(),
    messages: await convertToModelMessages(messages, { tools, ignoreIncompleteToolCalls: true }),
    tools,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: { anthropic: anthropicOptions },
    abortSignal: c.req.raw.signal,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      messageMetadata: ({ part }) => (part.type === 'start' ? { model: MODEL_ID } : undefined),
      onError: describeError,
    }),
  })
})

/** Turn provider errors into messages that are useful on screen during a demo. */
function describeError(error: unknown): string {
  console.error('[chat]', error)
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401) return 'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env.'
    if (error.statusCode === 429) return 'Rate limited by the Anthropic API. Wait a moment and try again.'
    if (error.statusCode === 529 || (error.statusCode ?? 0) >= 500)
      return 'The Anthropic API is temporarily overloaded. Please retry.'
    return error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong while generating the UI.'
}
