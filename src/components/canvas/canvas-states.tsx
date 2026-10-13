import { Blocks, Braces, MessageSquareText, MonitorSmartphone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Describe',
    text: 'Ask for a dashboard, a form, a plan — anything with a screen.',
  },
  {
    icon: Braces,
    title: 'Claude composes',
    text: 'It writes a JSON UI spec using only components from a trusted catalog.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Rendered live',
    text: 'The spec streams in and shadcn components stitch together as it arrives.',
  },
]

const CATALOG = [
  'Stack', 'Grid', 'Card', 'Tabs', 'Heading', 'Text', 'Badge', 'Alert', 'Metric', 'Chart', 'Table',
  'Progress', 'List', 'KeyValue', 'Timeline', 'Input', 'Select', 'Switch', 'Checkbox', 'Button',
]

export function CanvasEmpty() {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-10 p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-md">
          <Blocks className="size-6" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Interfaces, generated <span className="text-brand-gradient">in real time</span>
        </h2>
        <p className="max-w-lg text-sm text-pretty text-muted-foreground">
          Pick a prompt from the chat to see Claude design a screen from scratch — the canvas fills in component by
          component as the spec streams.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-xl border bg-background p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                <step.icon className="size-3.5" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
            </div>
            <div className="mt-3 text-sm font-medium">{step.title}</div>
            <p className="mt-1 text-xs/relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Component catalog</span>
        <div className="flex flex-wrap justify-center gap-1.5">
          {CATALOG.map((name) => (
            <span key={name} className="rounded-md border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Placeholder layout while Claude is thinking, before the first component streams in. */
export function CanvasComposing() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Composing interface">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl xl:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <p className="text-center text-sm font-medium text-shimmer">Claude is planning the layout…</p>
    </div>
  )
}
