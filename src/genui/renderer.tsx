import { useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import type { PartialSpec } from '@/lib/chat-types'
import { ComponentView, SlotSkeleton } from './nodes'
import { useGenUIStore, useSpecRoot } from './store'

type SpecRendererProps = {
  /** The renderUI toolCallId; keys this UI's state in the GenUI store. */
  specId: string
  spec: PartialSpec | undefined
  streaming: boolean
  className?: string
}

/**
 * Renders a (possibly still streaming) UI spec.
 *
 * The spec is synced into the GenUI store, then rendered from components[0]
 * (the root). Containers reference children by id; children that haven't
 * streamed in yet render as skeletons, so the layout appears first and fills
 * in as Claude writes the rest of the JSON.
 */
export function SpecRenderer({ specId, spec, streaming, className }: SpecRendererProps) {
  const syncSpec = useGenUIStore((s) => s.syncSpec)
  const root = useSpecRoot(specId)

  // Layout effect so the store is updated before the browser paints.
  useLayoutEffect(() => {
    syncSpec(specId, spec, streaming)
  }, [syncSpec, specId, spec, streaming])

  return (
    <div className={cn('@container flex flex-col gap-4', className)}>
      {root ? <ComponentView specId={specId} node={root} /> : streaming ? <SlotSkeleton tall /> : null}
    </div>
  )
}
