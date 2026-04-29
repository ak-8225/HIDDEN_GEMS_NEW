/**
 * Server-only resolver for destination hero/card images.
 * Tries English Wikipedia lead images first (accurate for landmark articles),
 * then Wikimedia Commons file search scoped by place name + India/state.
 *
 * Used by GET /api/destination-image — avoids browser CORS / silent failures on
 * direct Wikipedia calls from the client.
 */

const UA =
  "HiddenGems/1.0 (https://hidden-gems.local; educational/travel catalogue)"

function upgradeThumb(url: string, targetWidth = 1280): string {
  if (!url.includes("/thumb/")) return url
  return url.replace(/\/\d+px-([^/]+)$/, `/${targetWidth}px-$1`)
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
        "Api-User-Agent": UA,
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function enWikiSummaryThumb(title: string): Promise<string | null> {
  const t = title.trim().replace(/\s+/g, "_")
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`
  const rawData = await fetchJson(url)
  if (!rawData) return null
  const data = rawData as {
    type?: string
    thumbnail?: { source: string }
    originalimage?: { source: string }
  }
  if (data.type === "disambiguation") return null
  const raw = data.thumbnail?.source ?? data.originalimage?.source
  return raw ? upgradeThumb(raw, 1280) : null
}

async function enWikiPageImages(title: string): Promise<string | null> {
  const t = title.trim().replace(/\s+/g, "_")
  const apiUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail` +
    `&pithumbsize=1280&redirects=1&titles=${encodeURIComponent(t)}`
  const rawData = await fetchJson(apiUrl)
  if (!rawData) return null
  const data = rawData as {
    query?: { pages?: Record<string, { thumbnail?: { source: string }; missing?: string }> }
  }
  const pages = data.query?.pages ?? {}
  for (const p of Object.values(pages)) {
    if (p.missing) continue
    const src = p.thumbnail?.source
    if (src) return upgradeThumb(src, 1280)
  }
  return null
}

async function commonsSearchFiles(searchQuery: string, limit: number): Promise<string[]> {
  const apiUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search` +
    `&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&srlimit=${limit}`
  const rawData = await fetchJson(apiUrl)
  if (!rawData) return []
  const data = rawData as {
    query?: { search?: Array<{ title: string }> }
  }
  const rows = data.query?.search ?? []
    return rows
      .map((r) => r.title)
      .filter((t) => {
        const lower = t.toLowerCase()
        return (
          !/\.svg$/i.test(t) &&
          !/logo|icon|coat_of|flag_of|_map\b|diagram/i.test(lower)
        )
      })
}

async function commonsImageThumb(fileTitle: string): Promise<string | null> {
  const apiUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo` +
    `&iiprop=url|mime|thumbmime&iiurlwidth=1280`
  const rawData = await fetchJson(apiUrl)
  if (!rawData) return null
  const data = rawData as {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: Array<{
            url?: string
            thumburl?: string
            mime?: string
            thumbmime?: string
          }>
        }
      >
    }
  }
  const pages = data.query?.pages ?? {}
  for (const p of Object.values(pages)) {
    const ii = p.imageinfo?.[0]
    if (!ii) continue
    if (ii.mime === "image/svg+xml") continue
    return ii.thumburl ?? ii.url ?? null
  }
  return null
}

async function commonsBestFromQueries(queries: string[]): Promise<string | null> {
  const seen = new Set<string>()
  for (const q of queries) {
    const trimmed = q.trim()
    if (!trimmed || trimmed.length < 2) continue
    const files = await commonsSearchFiles(trimmed, 10)
    for (const ft of files) {
      if (seen.has(ft)) continue
      seen.add(ft)
      const thumb = await commonsImageThumb(ft)
      if (thumb) return thumb
    }
  }
  return null
}

/** Candidate Wikipedia titles to try (underscore form handled upstream). */
function wikiTitleCandidates(wikiTitle: string | null | undefined, name: string): string[] {
  const out: string[] = []
  const push = (s?: string | null) => {
    const v = s?.trim()
    if (v && !out.includes(v)) out.push(v)
  }
  push(wikiTitle ?? undefined)

  const stripParen = name.replace(/\([^)]*\)/g, "").trim()

  // "Chopta & Tungnath" → try segments
  for (const part of stripParen.split(/\s*&\s*/)) {
    const p = part.trim()
    if (p.length > 2) push(p.replace(/\s+/g, "_"))
  }

  push(stripParen.replace(/\s+/g, "_"))

  const noComma = stripParen.replace(/,/g, "").trim()
  if (noComma !== stripParen) push(noComma.replace(/\s+/g, "_"))

  return out
}

function commonsQueries(name: string, state: string, wikiTitle?: string | null): string[] {
  const clean = name.replace(/\([^)]*\)/g, "").trim()
  const short = clean.split(/\s*&\s*/)[0]?.trim() ?? clean

  const qs = [
    `"${clean}" ${state}`,
    `"${short}" India`,
    `"${clean}" India`,
    `${clean} ${state}`,
    `${short} ${state} tourism`,
    wikiTitle ? wikiTitle.replace(/_/g, " ") + " India" : "",
    `${clean}`,
  ]
  return [...new Set(qs.filter(Boolean))]
}

/**
 * Resolve a stable Wikimedia-hosted image URL for a destination.
 */
export async function resolveDestinationImage(input: {
  wikiTitle?: string | null
  name: string
  state: string
}): Promise<string | null> {
  const name = input.name.trim()
  const state = input.state.trim()
  if (!name || !state) return null

  const titles = wikiTitleCandidates(input.wikiTitle, name)

  for (const t of titles) {
    const u = await enWikiSummaryThumb(t)
    if (u) return u
  }
  for (const t of titles) {
    const u = await enWikiPageImages(t)
    if (u) return u
  }

  const cqueries = commonsQueries(name, state, input.wikiTitle)
  return commonsBestFromQueries(cqueries)
}
