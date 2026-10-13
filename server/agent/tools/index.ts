import type { ToolSet } from 'ai'
import { renderUI } from './render-ui.js'

/**
 * Tool registry.
 *
 * Method 3 (JSON UI spec): `renderUI` — the model composes the UI itself.
 * Method 2 (tool → prebuilt component) plugs in here next: add tools such as
 * `showWeather` or `showFlights` that fetch real data, and register a matching
 * renderer in src/genui/tool-renderers.tsx keyed by the same tool name.
 */
export const tools = {
  renderUI,
} satisfies ToolSet
