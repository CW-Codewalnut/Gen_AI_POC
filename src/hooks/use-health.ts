import { useEffect, useState } from 'react'

export type Health =
  | { state: 'loading' }
  | { state: 'offline' }
  | { state: 'ready'; configured: boolean; model: string; effort: string }

/** Asks the AI server which model it's using and whether an API key is set. */
export function useHealth(): Health {
  const [health, setHealth] = useState<Health>({ state: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: { configured: boolean; model: string; effort: string }) => setHealth({ state: 'ready', ...data }))
      .catch(() => {
        if (!controller.signal.aborted) setHealth({ state: 'offline' })
      })
    return () => controller.abort()
  }, [])

  return health
}
