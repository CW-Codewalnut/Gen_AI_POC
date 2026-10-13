import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Keeps a scroll container pinned to the bottom while content streams in,
 * unless the user has scrolled up to read something.
 */
export function useAutoScroll<T extends HTMLElement>(trigger: unknown, enabled = true) {
  const ref = useRef<T>(null)
  const pinned = useRef(true)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (el && enabled && pinned.current) el.scrollTop = el.scrollHeight
  }, [trigger, enabled])

  const pin = useCallback(() => {
    pinned.current = true
  }, [])

  return { ref, onScroll, pin }
}
