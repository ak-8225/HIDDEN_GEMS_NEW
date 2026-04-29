import { NextResponse } from "next/server"

import { resolveDestinationImage } from "@/lib/server/resolve-destination-image"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const wikiTitle = searchParams.get("wikiTitle")?.trim() || undefined
  const name = searchParams.get("name")?.trim()
  const state = searchParams.get("state")?.trim()

  if (!name || !state) {
    return NextResponse.json(
      { error: "Missing required query params: name, state" },
      { status: 400 },
    )
  }

  try {
    const url = await resolveDestinationImage({ wikiTitle, name, state })
    return NextResponse.json(
      { url },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    )
  } catch {
    return NextResponse.json({ url: null }, { status: 200 })
  }
}
