import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { catalog } from './catalog'
import { useSpecNode, useSpecStreaming } from './store'
import type { CatalogComponent, ChildIds, PartialComponent } from './types'

/** Renders the component with the given id, or a placeholder until it streams in. */
export function SpecNode({ specId, id }: { specId: string; id: string | undefined }) {
  const node = useSpecNode(specId, id)
  const streaming = useSpecStreaming(specId)

  if (!id) return null
  if (!node) return streaming ? <SlotSkeleton /> : null
  return <ComponentView specId={specId} node={node} />
}

/** Looks up the catalog implementation for a component and renders it. */
export function ComponentView({ specId, node }: { specId: string; node: PartialComponent }) {
  const streaming = useSpecStreaming(specId)
  const Impl = node.type ? (catalog[node.type] as CatalogComponent<typeof node.type>) : undefined

  if (!Impl) return streaming ? <SlotSkeleton /> : null

  const renderChildren = (ids: ChildIds) =>
    ids?.map((id, index) => <SpecNode key={`${index}:${id ?? ''}`} specId={specId} id={id} />)

  return (
    <div data-genui={node.type} className="min-w-0 animate-in duration-500 fade-in-0 slide-in-from-bottom-1">
      <Impl node={node as never} specId={specId} renderChildren={renderChildren} />
    </div>
  )
}

export function SlotSkeleton({ tall = false }: { tall?: boolean }) {
  return <Skeleton className={cn('w-full rounded-xl', tall ? 'h-48' : 'h-16')} />
}
