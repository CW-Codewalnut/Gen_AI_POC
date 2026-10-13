import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { CatalogComponent } from '../types'

const GAP = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' } as const

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

export const StackView: CatalogComponent<'Stack'> = ({ node, renderChildren }) => {
  const horizontal = node.direction === 'horizontal'
  return (
    <div
      className={cn(
        'flex',
        horizontal ? 'flex-row flex-wrap' : 'flex-col',
        GAP[node.gap ?? 'md'],
        node.align ? ALIGN[node.align] : horizontal ? 'items-center' : 'items-stretch',
        horizontal && node.align === 'stretch' && '*:flex-1',
      )}
    >
      {renderChildren(node.children)}
    </div>
  )
}

// Grids respond to the width of their container (the canvas or an enclosing
// card), not the viewport, so nested layouts collapse sensibly.
const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @md:grid-cols-2',
  3: 'grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3',
  4: 'grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4',
} as const

export const GridView: CatalogComponent<'Grid'> = ({ node, renderChildren }) => {
  const columns = Math.min(4, Math.max(1, Math.round(node.columns ?? 2))) as keyof typeof COLUMNS
  return (
    <div className={cn('grid', COLUMNS[columns], GAP[node.gap ?? 'md'])}>
      {renderChildren(node.children)}
    </div>
  )
}

export const CardView: CatalogComponent<'Card'> = ({ node, renderChildren }) => (
  <Card className="h-full shadow-xs">
    {(node.title || node.description) && (
      <CardHeader>
        {node.title && <CardTitle className="text-base">{node.title}</CardTitle>}
        {node.description && <CardDescription>{node.description}</CardDescription>}
      </CardHeader>
    )}
    <CardContent className="@container flex flex-1 flex-col gap-4">
      {renderChildren(node.children)}
    </CardContent>
  </Card>
)

export const TabsView: CatalogComponent<'Tabs'> = ({ node, renderChildren }) => {
  const tabs = (node.tabs ?? []).filter((tab) => tab?.label)
  if (!tabs.length) return null
  return (
    <Tabs defaultValue="tab-0" className="gap-4">
      <TabsList>
        {tabs.map((tab, index) => (
          <TabsTrigger key={index} value={`tab-${index}`}>
            {tab?.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={index} value={`tab-${index}`} className="flex flex-col gap-4">
          {renderChildren(tab?.children)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
