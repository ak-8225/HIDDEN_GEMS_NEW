/**
 * Client helper — resolves Wikimedia-hosted photos via `/api/destination-image`.
 * Actual Wikipedia / Commons fetching happens server-side (no CORS issues).
 */

const INFLIGHT = new Map<string, Promise<string | null>>()

export async function fetchResolvedDestinationImage(params: {
  wikiTitle?: string | null
  name: string
  state: string
}): Promise<string | null> {
  const key = `${params.wikiTitle ?? ""}|${params.name}|${params.state}`
  const existing = INFLIGHT.get(key)
  if (existing) return existing

  const promise = (async () => {
    try {
      const sp = new URLSearchParams()
      sp.set("name", params.name)
      sp.set("state", params.state)
      if (params.wikiTitle) sp.set("wikiTitle", params.wikiTitle)
      const res = await fetch(`/api/destination-image?${sp.toString()}`)
      if (!res.ok) return null
      const data = (await res.json()) as { url?: string | null }
      return data.url ?? null
    } catch {
      return null
    }
  })()

  INFLIGHT.set(key, promise)
  promise.finally(() => INFLIGHT.delete(key))
  return promise
}
