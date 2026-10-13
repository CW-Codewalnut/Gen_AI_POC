import type { ReactNode } from 'react'
import type { DeepPartial } from 'ai'
import type { UIComponent, UIComponentOf, UIComponentType } from '@shared/ui-spec'

/** A component as it exists mid-stream: any field may still be missing. */
export type PartialComponent = DeepPartial<UIComponent>
export type PartialNode<T extends UIComponentType> = DeepPartial<UIComponentOf<T>>

export type ChildIds = readonly (string | undefined)[] | undefined

/** Props every catalog component receives from the renderer. */
export type CatalogProps<T extends UIComponentType> = {
  node: PartialNode<T>
  /** Which generated UI this component belongs to; the key into the GenUI store. */
  specId: string
  /** Renders child components by id (used by containers). */
  renderChildren: (ids: ChildIds) => ReactNode
}

export type CatalogComponent<T extends UIComponentType> = (props: CatalogProps<T>) => ReactNode

export type Catalog = { [T in UIComponentType]: CatalogComponent<T> }

export type FieldValue = string | boolean

export type ButtonAction = { message?: string; includeFormData?: boolean }
