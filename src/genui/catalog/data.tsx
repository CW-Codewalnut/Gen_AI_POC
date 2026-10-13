import { ArrowDownRight, ArrowUpRight, Check, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { CatalogIcon, hasIcon } from '../icons'
import type { CatalogComponent } from '../types'

const TREND = {
  up: { icon: ArrowUpRight, className: 'text-success' },
  down: { icon: ArrowDownRight, className: 'text-critical' },
  neutral: { icon: Minus, className: 'text-muted-foreground' },
} as const

export const MetricView: CatalogComponent<'Metric'> = ({ node }) => {
  const trend = TREND[node.trend ?? 'neutral']
  return (
    <Card size="sm" className="h-full gap-2 px-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{node.label}</span>
        {hasIcon(node.icon) && (
          <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
            <CatalogIcon name={node.icon} className="size-3.5" />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{node.value}</div>
      {(node.change || node.caption) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {node.change && (
            <span className={cn('inline-flex items-center gap-0.5 font-medium', trend.className)}>
              <trend.icon className="size-3.5" aria-hidden />
              {node.change}
            </span>
          )}
          {node.caption && <span className="text-muted-foreground">{node.caption}</span>}
        </div>
      )}
    </Card>
  )
}

export const TableView: CatalogComponent<'Table'> = ({ node }) => {
  const columns = (node.columns ?? []).filter((column) => column?.key)
  const rows = (node.rows ?? []).filter(Boolean)
  if (!columns.length) return null
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        {node.caption && <TableCaption className="mb-3">{node.caption}</TableCaption>}
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column!.key} className={cn(column!.align === 'right' && 'text-right')}>
                {column!.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column!.key}
                  className={cn(column!.align === 'right' && 'text-right tabular-nums')}
                >
                  {row?.[column!.key!]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export const ProgressView: CatalogComponent<'Progress'> = ({ node }) => {
  const value = Math.min(100, Math.max(0, Number(node.value) || 0))
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{node.label}</span>
        <span className="text-muted-foreground tabular-nums">{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
      {node.caption && <span className="text-xs text-muted-foreground">{node.caption}</span>}
    </div>
  )
}

export const ListView: CatalogComponent<'List'> = ({ node }) => {
  const items = (node.items ?? []).filter((item) => item?.title)
  return (
    <ul className="divide-y rounded-lg border">
      {items.map((item, index) => {
        return (
          <li key={index} className="flex items-center gap-3 px-3.5 py-3">
            {hasIcon(item?.icon) && (
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <CatalogIcon name={item?.icon} className="size-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {item?.title}
                {item?.badge && <Badge variant="secondary">{item.badge}</Badge>}
              </div>
              {item?.description && (
                <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{item.description}</p>
              )}
            </div>
            {item?.meta && (
              <span className="shrink-0 text-sm font-medium tabular-nums">{item.meta}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export const KeyValueView: CatalogComponent<'KeyValue'> = ({ node }) => (
  <dl className="grid gap-2.5 text-sm">
    {(node.items ?? []).filter(Boolean).map((item, index) => (
      <div key={index} className="flex items-baseline justify-between gap-4">
        <dt className="text-muted-foreground">{item?.label}</dt>
        <dd className="text-right font-medium">{item?.value}</dd>
      </div>
    ))}
  </dl>
)

export const TimelineView: CatalogComponent<'Timeline'> = ({ node }) => {
  const items = (node.items ?? []).filter((item) => item?.title)
  return (
    <ol className="relative flex flex-col">
      {items.map((item, index) => {
        const status = item?.status ?? 'upcoming'
        const last = index === items.length - 1
        return (
          <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute top-6 bottom-0 left-[11px] w-px bg-border" aria-hidden />}
            <span
              className={cn(
                'relative z-10 mt-0.5 grid size-[23px] shrink-0 place-items-center rounded-full border-2',
                status === 'done' && 'border-primary bg-primary text-primary-foreground',
                status === 'current' && 'border-primary bg-background ring-4 ring-primary/15',
                status === 'upcoming' && 'border-border bg-background',
              )}
            >
              {status === 'done' && <Check className="size-3" strokeWidth={3} />}
              {status === 'current' && <span className="size-2 animate-pulse rounded-full bg-primary" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className={cn('text-sm font-medium', status === 'upcoming' && 'text-muted-foreground')}>
                  {item?.title}
                </span>
                {item?.time && <span className="text-xs text-muted-foreground tabular-nums">{item.time}</span>}
              </div>
              {item?.description && (
                <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{item.description}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
