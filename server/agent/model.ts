import { anthropic, type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic'

/**
 * Claude configuration. Override in .env:
 *   ANTHROPIC_MODEL   claude-opus-5-5 (default) | claude-sonnet-5-5 | claude-haiku-5-5
 *   ANTHROPIC_EFFORT  low (default, snappiest for live demos) | medium | high
 */
export const MODEL_ID = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'

const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
type Effort = (typeof EFFORT_LEVELS)[number]
const envEffort = process.env.ANTHROPIC_EFFORT as Effort | undefined
export const EFFORT: Effort = envEffort && EFFORT_LEVELS.includes(envEffort) ? envEffort : 'low'

export const model = anthropic(MODEL_ID)

export const anthropicOptions = {
  effort: EFFORT,
  // If a safety classifier declines a turn, the API retries it server-side on
  // Anthropic's recommended fallback model instead of returning a refusal.
  fallbacks: 'default',
} satisfies AnthropicLanguageModelOptions

// Thinking tokens count toward this limit, so leave headroom above the spec size.
export const MAX_OUTPUT_TOKENS = 32_000
