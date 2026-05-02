"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookmarkCheck,
  Compass,
  Crown,
  Heart,
  Sparkles,
  Star,
  Trophy,
  Wand2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  INDIAN_STATES,
  STATE_META,
  getAllDestinations,
  readLikes,
  readSaves,
  type Destination,
} from "@/lib/destinations"
import { canonicalState } from "@/lib/india-geo"
import { IndiaMap } from "@/components/india-map"
import { useSupabaseUser } from "@/hooks/use-supabase-user"

interface BadgeDef {
  id: string
  title: string
  description: string
  emoji: string
  earned: (ctx: PassportCtx) => boolean
}

interface PassportCtx {
  destinations: Destination[]
  likedIds: number[]
  savedIds: number[]
  unlockedStates: Set<string>
}

const BADGES: BadgeDef[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Saved or liked your first gem",
    emoji: "🎉",
    earned: (c) => c.likedIds.length + c.savedIds.length > 0,
  },
  {
    id: "five-states",
    title: "Pentastate",
    description: "Unlocked 5 different states",
    emoji: "🪙",
    earned: (c) => c.unlockedStates.size >= 5,
  },
  {
    id: "ten-states",
    title: "Wanderer",
    description: "Unlocked 10 different states",
    emoji: "🗺️",
    earned: (c) => c.unlockedStates.size >= 10,
  },
  {
    id: "twenty-states",
    title: "Cartographer",
    description: "Unlocked 20 states — half of India",
    emoji: "🧭",
    earned: (c) => c.unlockedStates.size >= 20,
  },
  {
    id: "north-east",
    title: "Sevenfold",
    description: "Visited any state in the North-East",
    emoji: "🌄",
    earned: (c) =>
      [...c.unlockedStates].some((s) => STATE_META[s]?.region === "North-East"),
  },
  {
    id: "coastal",
    title: "Coastline",
    description: "Saved a beach or coastal gem",
    emoji: "🏝️",
    earned: (c) =>
      c.destinations.some(
        (d) =>
          (c.likedIds.includes(d.id) || c.savedIds.includes(d.id)) &&
          d.type === "Beach",
      ),
  },
  {
    id: "himalayan",
    title: "Himalayan",
    description: "Saved a high-altitude adventure",
    emoji: "🏔️",
    earned: (c) =>
      c.destinations.some(
        (d) =>
          (c.likedIds.includes(d.id) || c.savedIds.includes(d.id)) &&
          d.type === "Adventurous" &&
          d.weather.some((w) => w === "Snowy" || w === "Cold"),
      ),
  },
  {
    id: "spiritual",
    title: "Pilgrim",
    description: "Saved a spiritual journey",
    emoji: "🕉️",
    earned: (c) =>
      c.destinations.some(
        (d) =>
          (c.likedIds.includes(d.id) || c.savedIds.includes(d.id)) &&
          d.type === "Spiritual",
      ),
  },
  {
    id: "all-india",
    title: "Sovereign",
    description: "Unlocked every Indian state & UT",
    emoji: "👑",
    earned: (c) => c.unlockedStates.size >= INDIAN_STATES.length - 1, // minus "All States"
  },
]

export default function PassportPage() {
  const { displayName, status } = useSupabaseUser()
  const [destinations, setDestinations] = React.useState<Destination[]>([])
  const [likedIds, setLikedIds] = React.useState<number[]>([])
  const [savedIds, setSavedIds] = React.useState<number[]>([])

  React.useEffect(() => {
    const all = getAllDestinations()
    setDestinations(all)
    setLikedIds(readLikes())
    const saves = readSaves()
    const allSaved = new Set<number>()
    for (const ids of Object.values(saves)) for (const id of ids) allSaved.add(id)
    setSavedIds([...allSaved])
  }, [])

  const allStates = React.useMemo(
    () => INDIAN_STATES.filter((s) => s !== "All States"),
    [],
  )

  const unlockedStates = React.useMemo(() => {
    const s = new Set<string>()
    const ids = new Set([...likedIds, ...savedIds])
    for (const d of destinations) if (ids.has(d.id)) s.add(d.state)
    return s
  }, [destinations, likedIds, savedIds])

  const ctx: PassportCtx = {
    destinations,
    likedIds,
    savedIds,
    unlockedStates,
  }

  const totalStates = allStates.length
  const progress = totalStates === 0 ? 0 : (unlockedStates.size / totalStates) * 100

  const earnedBadges = BADGES.filter((b) => b.earned(ctx))
  const lockedBadges = BADGES.filter((b) => !b.earned(ctx))

  const explorerName =
    status === "authenticated" && displayName ? displayName : "Explorer"

  const onShare = async () => {
    const text = `${explorerName} has unlocked ${unlockedStates.size}/${totalStates} Indian states on Hidden Gems 🇮🇳`
    if (typeof window === "undefined") return
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Hidden Gems Passport",
          text,
          url: window.location.origin + "/passport",
        })
      } catch {
        /* cancelled */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(244,114,182,0.18),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(99,102,241,0.18),transparent_55%)]"
        />
        <div className="absolute inset-0 bg-grid-pattern text-foreground/5" aria-hidden />
        <div className="container relative mx-auto px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-rose-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Crown className="h-3.5 w-3.5" />
            Travel Passport
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Hello, <span className="text-gradient-brand">{explorerName}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every gem you like or save unlocks a state on your map. Collect
            badges, build a travel CV, and share where you&apos;ve been —
            digitally first, in person someday.
          </p>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Top stats card */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-fuchsia-500/10 p-6 shadow-soft-lg sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                  States unlocked
                </div>
                <div className="mt-1 flex items-baseline gap-2 font-semibold">
                  <span className="text-6xl tabular-nums">{unlockedStates.size}</span>
                  <span className="text-2xl text-muted-foreground">
                    / {totalStates}
                  </span>
                </div>
                <div className="mt-3 h-2.5 w-64 max-w-full overflow-hidden rounded-full bg-background/60 ring-1 ring-amber-500/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500 transition-[width] duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {progress.toFixed(0)}% of India explored
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat icon={Heart} label="Liked"  value={likedIds.length} />
                <Stat icon={BookmarkCheck} label="Saved" value={savedIds.length} />
                <Stat icon={Trophy} label="Badges" value={earnedBadges.length} />
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap items-center gap-2">
              <Button onClick={onShare} className="gap-1.5 shadow-soft">
                <Sparkles className="h-3.5 w-3.5" />
                Share my passport
              </Button>
              <Link href="/explore">
                <Button variant="outline" className="gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  Discover more gems
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Badge wall */}
          <div className="rounded-3xl border border-border/60 bg-card/85 p-5 shadow-soft backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Badges
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                {earnedBadges.length} / {BADGES.length}
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-3">
              {[...earnedBadges, ...lockedBadges].map((b) => {
                const earned = b.earned(ctx)
                return (
                  <li
                    key={b.id}
                    title={b.description}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition",
                      earned
                        ? "border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-rose-500/10 shadow-soft animate-stamp-pop"
                        : "border-border/60 bg-muted/30 opacity-65 grayscale",
                    )}
                  >
                    <span aria-hidden className="text-2xl">
                      {b.emoji}
                    </span>
                    <span className="text-[11px] font-semibold leading-tight">
                      {b.title}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* India map with unlocked states glowing */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-soft-lg">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(244,114,182,0.16),transparent_55%)]"
            />
            <div className="relative w-full p-5">
              <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-300/80">
                <span>India · Travel passport</span>
                <span>{unlockedStates.size}/{allStates.length} states</span>
              </div>
              <IndiaMap
                mode="passport"
                unlockedStates={
                  new Set([...unlockedStates].map((s) => canonicalState(s)))
                }
              />
              <div className="mt-3 inline-flex items-center gap-3 text-[11px] text-slate-300/85">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-amber-300/30" />
                  Unlocked
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-500 ring-2 ring-slate-500/30" />
                  Locked
                </span>
              </div>
            </div>
          </div>


          {/* States checklist */}
          <aside className="rounded-3xl border border-border/60 bg-card/85 p-5 shadow-soft backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              All states & UTs
            </h2>
            <ul className="mt-4 max-h-[600px] space-y-1 overflow-y-auto pr-1">
              {allStates.map((s) => {
                const earned = unlockedStates.has(s)
                return (
                  <li key={s}>
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                        earned ? "bg-amber-500/10 text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden className="text-base">
                          {STATE_META[s]?.emoji ?? "📍"}
                        </span>
                        <span className="truncate">{s}</span>
                      </span>
                      {earned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                          <Star className="h-2.5 w-2.5 fill-amber-950" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                          Locked
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </aside>
        </section>

        {unlockedStates.size === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            <Wand2 className="mx-auto h-5 w-5 text-primary" />
            Like or save any gem on{" "}
            <Link href="/explore" className="font-semibold text-primary underline-offset-2 hover:underline">
              Explore
            </Link>{" "}
            to unlock your first state on the passport.
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 px-3 py-2 backdrop-blur-md">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" />
        {label}
      </span>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

