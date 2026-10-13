/**
 * Generative UI catalog — the single source of truth for Method 3 (JSON UI spec).
 *
 * The model never writes code. It emits a flat list of components picked from
 * this catalog; the client renderer maps each `type` to a shadcn-based React
 * component. The same Zod schema is:
 *   - sent to Claude as the `renderUI` tool's input schema (server/agent/tools)
 *   - used for TypeScript types in the renderer (src/genui)
 *
 * The spec is a flat adjacency list (A2UI-style) rather than a nested tree:
 * containers reference children by id. This keeps the schema non-recursive and
 * lets the UI render progressively while the JSON is still streaming — slots
 * whose child hasn't arrived yet show a skeleton.
 */
import { z } from 'zod'

const id = z.string().describe('Unique id within this spec, e.g. "kpi-revenue"')
const children = z
  .array(z.string())
  .describe('Ids of child components, in display order. Define each child later in the list.')

const icon = z
  .string()
  .optional()
  .describe(
    'Optional icon name: dollar, users, trending-up, trending-down, activity, cart, calendar, clock, map-pin, plane, hotel, star, check, alert, mail, phone, globe, zap, shield, package, card, chart, heart, briefcase, code, server, cloud, file, target, rocket, sparkles, utensils, camera, book, home, settings, user, building, truck, gift, coffee, sun, leaf',
  )

const cell = z.union([z.string(), z.number()])

// ── Layout ────────────────────────────────────────────────────────────────

const Stack = z.object({
  id,
  type: z.literal('Stack'),
  direction: z.enum(['vertical', 'horizontal']).default('vertical'),
  gap: z.enum(['sm', 'md', 'lg']).default('md'),
  align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  children,
})

const Grid = z.object({
  id,
  type: z.literal('Grid'),
  columns: z.number().int().min(1).max(4).describe('Columns on wide screens; collapses on narrow screens'),
  gap: z.enum(['sm', 'md', 'lg']).default('md'),
  children,
})

const Card = z.object({
  id,
  type: z.literal('Card'),
  title: z.string().optional(),
  description: z.string().optional(),
  children,
})

const Tabs = z.object({
  id,
  type: z.literal('Tabs'),
  tabs: z
    .array(z.object({ label: z.string(), children }))
    .describe('Each tab lists the ids of the components it shows'),
})

// ── Content ───────────────────────────────────────────────────────────────

const Heading = z.object({
  id,
  type: z.literal('Heading'),
  text: z.string(),
  level: z.number().int().min(1).max(3).default(2),
})

const Text = z.object({
  id,
  type: z.literal('Text'),
  text: z.string(),
  tone: z.enum(['default', 'muted']).default('default'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
})

const Badge = z.object({
  id,
  type: z.literal('Badge'),
  text: z.string(),
  variant: z.enum(['default', 'secondary', 'outline', 'success', 'warning', 'destructive']).default('secondary'),
})

const Alert = z.object({
  id,
  type: z.literal('Alert'),
  title: z.string(),
  description: z.string().optional(),
  variant: z.enum(['info', 'success', 'warning', 'destructive']).default('info'),
})

const Separator = z.object({ id, type: z.literal('Separator') })

// ── Data display ──────────────────────────────────────────────────────────

const Metric = z.object({
  id,
  type: z.literal('Metric'),
  label: z.string(),
  value: z.string().describe('Pre-formatted value, e.g. "$48.2k" or "92%"'),
  change: z.string().optional().describe('Pre-formatted delta, e.g. "+12.4%"'),
  trend: z.enum(['up', 'down', 'neutral']).optional().describe('Whether the change is good (up) or bad (down)'),
  caption: z.string().optional().describe('Short context line, e.g. "vs last quarter"'),
  icon,
})

const Chart = z.object({
  id,
  type: z.literal('Chart'),
  chartType: z.enum(['bar', 'line', 'area', 'pie']),
  title: z.string().optional(),
  description: z.string().optional(),
  xKey: z.string().describe('Key in each data row used for the x axis (or slice name for pie)'),
  series: z
    .array(z.object({ key: z.string(), label: z.string() }))
    .min(1)
    .max(5)
    .describe('Numeric keys to plot. Pie uses only the first series.'),
  data: z.array(z.record(z.string(), cell)).describe('Rows, e.g. [{"month":"Jan","revenue":42}]'),
  stacked: z.boolean().optional(),
})

const Table = z.object({
  id,
  type: z.literal('Table'),
  caption: z.string().optional(),
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      align: z.enum(['left', 'right']).optional().describe('Use right for numbers'),
    }),
  ),
  rows: z.array(z.record(z.string(), cell)),
})

const Progress = z.object({
  id,
  type: z.literal('Progress'),
  label: z.string(),
  value: z.number().min(0).max(100),
  caption: z.string().optional(),
})

const List = z.object({
  id,
  type: z.literal('List'),
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      meta: z.string().optional().describe('Right-aligned detail, e.g. a price or time'),
      badge: z.string().optional(),
      icon,
    }),
  ),
})

const KeyValue = z.object({
  id,
  type: z.literal('KeyValue'),
  items: z.array(z.object({ label: z.string(), value: z.string() })),
})

const Timeline = z.object({
  id,
  type: z.literal('Timeline'),
  items: z.array(
    z.object({
      title: z.string(),
      time: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['done', 'current', 'upcoming']).default('upcoming'),
    }),
  ),
})

// ── Inputs & actions ──────────────────────────────────────────────────────

const fieldName = z.string().describe('Form field name; values are sent back with button actions')

const Input = z.object({
  id,
  type: z.literal('Input'),
  name: fieldName,
  label: z.string(),
  placeholder: z.string().optional(),
  inputType: z.enum(['text', 'email', 'number', 'date', 'tel']).default('text'),
  defaultValue: z.string().optional(),
})

const Textarea = z.object({
  id,
  type: z.literal('Textarea'),
  name: fieldName,
  label: z.string(),
  placeholder: z.string().optional(),
})

const Select = z.object({
  id,
  type: z.literal('Select'),
  name: fieldName,
  label: z.string(),
  options: z.array(z.string()),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
})

const Checkbox = z.object({
  id,
  type: z.literal('Checkbox'),
  name: fieldName,
  label: z.string(),
  defaultChecked: z.boolean().optional(),
})

const Switch = z.object({
  id,
  type: z.literal('Switch'),
  name: fieldName,
  label: z.string(),
  description: z.string().optional(),
  defaultChecked: z.boolean().optional(),
})

const Button = z.object({
  id,
  type: z.literal('Button'),
  label: z.string(),
  variant: z.enum(['default', 'secondary', 'outline', 'ghost']).default('default'),
  icon,
  action: z
    .object({
      message: z
        .string()
        .describe('Chat message sent on click, phrased as the user, e.g. "Book the Pro plan"'),
      includeFormData: z
        .boolean()
        .optional()
        .describe('Attach the current values of all input fields in this UI'),
    })
    .describe('Clicking sends a follow-up chat message so the conversation continues'),
})

export const uiComponentSchema = z.discriminatedUnion('type', [
  Stack,
  Grid,
  Card,
  Tabs,
  Heading,
  Text,
  Badge,
  Alert,
  Separator,
  Metric,
  Chart,
  Table,
  Progress,
  List,
  KeyValue,
  Timeline,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Button,
])

export const uiSpecSchema = z.object({
  title: z.string().describe('Short title for this UI, e.g. "Q3 Revenue Dashboard"'),
  components: z
    .array(uiComponentSchema)
    .min(1)
    .describe(
      'Flat list. components[0] is the root. List parents before children, in reading order.',
    ),
})

// Input types: the renderer sees what the model sent, before Zod defaults apply.
export type UISpec = z.input<typeof uiSpecSchema>
export type UIComponent = z.input<typeof uiComponentSchema>
export type UIComponentType = UIComponent['type']
export type UIComponentOf<T extends UIComponentType> = Extract<UIComponent, { type: T }>

/** What the `renderUI` tool returns to the model once the client has the spec. */
export type RenderUIOutput = { status: 'rendered'; componentCount: number }

export const CONTAINER_TYPES = ['Stack', 'Grid', 'Card', 'Tabs'] as const
