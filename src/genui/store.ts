import { create } from 'zustand'
import type { PartialSpec } from '@/lib/chat-types'
import type { ButtonAction, ChildIds, FieldValue, PartialComponent } from './types'

/** Everything the renderer needs for one generated UI (one renderUI tool call). */
type SpecState = {
  /** The spec object last synced; lets repeated syncs of the same data be skipped. */
  source: PartialSpec | undefined
  root: PartialComponent | undefined
  byId: Record<string, PartialComponent>
  streaming: boolean
  /** Form field values, keyed by the `name` Claude gave each input. */
  values: Record<string, FieldValue>
}

type GenUIStore = {
  /** Keyed by toolCallId, so several UIs (canvas, inline, history) stay independent. */
  specs: Record<string, SpecState>
  /** True while the chat is answering; generated buttons are disabled meanwhile. */
  busy: boolean
  /** Sends a chat message; set by App so generated buttons can continue the conversation. */
  sendMessage: (text: string) => void

  syncSpec: (specId: string, spec: PartialSpec | undefined, streaming: boolean) => void
  setFieldValue: (specId: string, name: string, value: FieldValue) => void
  runAction: (specId: string, action: ButtonAction) => void
  reset: () => void
}

export const useGenUIStore = create<GenUIStore>()((set, get) => ({
  specs: {},
  busy: false,
  sendMessage: () => {},

  syncSpec: (specId, spec, streaming) => {
    const current = get().specs[specId]
    if (current && current.source === spec && current.streaming === streaming) return
    set((state) => ({
      specs: {
        ...state.specs,
        [specId]: { ...indexSpec(spec), source: spec, streaming, values: current?.values ?? {} },
      },
    }))
  },

  setFieldValue: (specId, name, value) =>
    set((state) => {
      const spec = state.specs[specId]
      if (!spec) return state
      return { specs: { ...state.specs, [specId]: { ...spec, values: { ...spec.values, [name]: value } } } }
    }),

  runAction: (specId, action) => {
    const { specs, sendMessage } = get()
    const spec = specs[specId]
    if (!action.message || !spec) return
    sendMessage(action.includeFormData ? withFormData(action.message, spec) : action.message)
  },

  reset: () => set({ specs: {} }),
}))

// ── Selector hooks used by the renderer and catalog components ──────────────

export const useSpecRoot = (specId: string) => useGenUIStore((s) => s.specs[specId]?.root)

export const useSpecNode = (specId: string, id: string | undefined) =>
  useGenUIStore((s) => (id ? s.specs[specId]?.byId[id] : undefined))

export const useSpecStreaming = (specId: string) => useGenUIStore((s) => s.specs[specId]?.streaming ?? false)

/** Buttons are disabled while the spec is still streaming or the chat is busy. */
export const useActionsDisabled = (specId: string) =>
  useGenUIStore((s) => s.busy || (s.specs[specId]?.streaming ?? false))

/** Reads and writes one form field of a spec. */
export function useField(specId: string, name: string | undefined, fallback: FieldValue | undefined) {
  const stored = useGenUIStore((s) => (name ? s.specs[specId]?.values[name] : undefined))
  const setFieldValue = useGenUIStore((s) => s.setFieldValue)
  const setValue = (value: FieldValue) => {
    if (name) setFieldValue(specId, name, value)
  }
  return [stored ?? fallback, setValue] as const
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Indexes components by id. components[0] is the root. */
function indexSpec(spec: PartialSpec | undefined) {
  const components = (spec?.components ?? []).filter((c): c is PartialComponent => Boolean(c))
  const byId: Record<string, PartialComponent> = {}
  for (const component of components) if (component.id) byId[component.id] = component
  const first = components[0]
  const safe = removeCycles(first, byId)
  // The root may still be streaming its id, so fall back to the raw first component.
  return { root: (first?.id && safe[first.id]) || first, byId: safe }
}

/**
 * A model could accidentally make a component its own ancestor (A → B → A),
 * which would recurse forever while rendering. Walk the tree from the root and
 * drop any child reference that points back up the current path.
 */
function removeCycles(root: PartialComponent | undefined, byId: Record<string, PartialComponent>) {
  const safe = { ...byId }

  const visit = (node: PartialComponent | undefined, path: ReadonlySet<string>) => {
    if (!node?.id || path.has(node.id)) return
    const nextPath = new Set(path).add(node.id)
    const keep = (ids: ChildIds) => ids?.filter((id) => !id || !nextPath.has(id))

    if (node.type === 'Tabs') {
      const tabs = node.tabs?.map((tab) => (tab ? { ...tab, children: keep(tab.children) } : tab))
      safe[node.id] = { ...node, tabs }
      tabs?.forEach((tab) => tab?.children?.forEach((id) => id && visit(byId[id], nextPath)))
    } else if ('children' in node && node.children) {
      const children = keep(node.children)
      safe[node.id] = { ...node, children }
      children?.forEach((id) => id && visit(byId[id], nextPath))
    }
  }

  visit(root, new Set())
  return safe
}

/** Appends the current form values, labelled, to a button's message. */
function withFormData(message: string, spec: SpecState) {
  const lines: string[] = []
  for (const component of Object.values(spec.byId)) {
    if (!('name' in component) || !component.name) continue
    const value = spec.values[component.name] ?? initialValue(component)
    if (value === undefined || value === '') continue
    const label = ('label' in component && component.label) || component.name
    lines.push(`- ${label}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}`)
  }
  return lines.length ? `${message}\n\n${lines.join('\n')}` : message
}

function initialValue(component: PartialComponent): FieldValue | undefined {
  if ('defaultValue' in component && component.defaultValue !== undefined) return component.defaultValue
  if ('defaultChecked' in component && component.defaultChecked !== undefined) return component.defaultChecked
  return undefined
}
