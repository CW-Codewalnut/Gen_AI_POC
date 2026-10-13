import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useSpecStreaming } from '../store'
import type { CatalogComponent, PartialNode } from '../types'

/** Categorical slots, in fixed order (validated palette in index.css). Never cycled. */
const SLOTS = 5
const slotColor = (index: number) => `var(--chart-${index + 1})`

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value !== 'string') return undefined
  const parsed = Number(value.replace(/[^0-9.-]/g, ''))
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined
}

export const ChartView: CatalogComponent<'Chart'> = ({ node, specId }) => {
  const streaming = useSpecStreaming(specId)
  return (
    <figure className="flex flex-col gap-3">
      {(node.title || node.description) && (
        <figcaption>
          {node.title && <div className="text-sm font-medium">{node.title}</div>}
          {node.description && <div className="text-sm text-muted-foreground">{node.description}</div>}
        </figcaption>
      )}
      {node.chartType === 'pie' ? (
        <PieView node={node} animate={!streaming} />
      ) : (
        <CartesianView node={node} animate={!streaming} />
      )}
    </figure>
  )
}

type ViewProps = { node: PartialNode<'Chart'>; animate: boolean }

function CartesianView({ node, animate }: ViewProps) {
  // Series keys from the model can contain spaces or symbols, which aren't valid
  // in CSS variable names, so map them to stable internal keys (s0, s1, …).
  const series = useMemo(
    () => (node.series ?? []).filter((s) => s?.key).slice(0, SLOTS),
    [node.series],
  )

  const config = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        series.map((s, index) => [`s${index}`, { label: s!.label ?? s!.key, color: slotColor(index) }]),
      ),
    [series],
  )

  const data = useMemo(
    () =>
      (node.data ?? []).filter(Boolean).map((row) => ({
        x: String(row![node.xKey ?? ''] ?? ''),
        ...Object.fromEntries(series.map((s, index) => [`s${index}`, toNumber(row![s!.key!])])),
      })),
    [node.data, node.xKey, series],
  )

  if (!series.length || !data.length) return <ChartPlaceholder />

  const showLegend = series.length > 1
  const stackId = node.stacked ? 'stack' : undefined
  const axes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
      <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact.format(v)} />
      {showLegend && <ChartLegend content={<ChartLegendContent />} />}
    </>
  )

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      {node.chartType === 'line' ? (
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          {axes}
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          {series.map((_, index) => (
            <Line
              key={index}
              dataKey={`s${index}`}
              type="monotone"
              stroke={`var(--color-s${index})`}
              strokeWidth={2}
              dot={data.length <= 12 ? { r: 3 } : false}
              activeDot={{ r: 5 }}
              isAnimationActive={animate}
            />
          ))}
        </LineChart>
      ) : node.chartType === 'area' ? (
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          {axes}
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          {series.map((_, index) => (
            <Area
              key={index}
              dataKey={`s${index}`}
              type="monotone"
              stackId={stackId}
              stroke={`var(--color-s${index})`}
              fill={`var(--color-s${index})`}
              fillOpacity={0.18}
              strokeWidth={2}
              isAnimationActive={animate}
            />
          ))}
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }} barGap={2}>
          {axes}
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          {series.map((_, index) => (
            <Bar
              key={index}
              dataKey={`s${index}`}
              stackId={stackId}
              fill={`var(--color-s${index})`}
              radius={stackId && index < series.length - 1 ? 0 : [4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={animate}
            />
          ))}
        </BarChart>
      )}
    </ChartContainer>
  )
}

function PieView({ node, animate }: ViewProps) {
  const valueKey = node.series?.[0]?.key

  // More slices than palette slots fold into "Other" instead of reusing colors.
  const slices = useMemo(() => {
    const rows = (node.data ?? [])
      .filter(Boolean)
      .map((row) => ({ name: String(row![node.xKey ?? ''] ?? ''), value: toNumber(row![valueKey ?? '']) }))
      .filter((row): row is { name: string; value: number } => row.value !== undefined && row.name !== '')
    if (rows.length <= SLOTS) return rows
    const head = rows.slice(0, SLOTS - 1)
    const rest = rows.slice(SLOTS - 1).reduce((sum, row) => sum + row.value, 0)
    return [...head, { name: 'Other', value: rest }]
  }, [node.data, node.xKey, valueKey])

  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(slices.map((slice, index) => [`p${index}`, { label: slice.name, color: slotColor(index) }])),
    [slices],
  )

  if (!slices.length) return <ChartPlaceholder />

  const data = slices.map((slice, index) => ({ ...slice, key: `p${index}`, fill: `var(--color-p${index})` }))

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="key"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={1}
          stroke="var(--card)"
          strokeWidth={2}
          isAnimationActive={animate}
        />
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  )
}

function ChartPlaceholder() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-muted/60" />
}
