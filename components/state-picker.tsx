"use client"

import * as React from "react"
import { Check, MapPin, Search, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  INDIAN_STATES,
  STATE_META,
  getStateStats,
  type Destination,
} from "@/lib/destinations"

interface StatePickerProps {
  destinations: Destination[]
  value: string | null
  onChange: (state: string | null) => void
  className?: string
}

const REGION_ORDER = [
  "North",
  "North-East",
  "East",
  "Central",
  "West",
  "South",
  "Islands",
] as const

export function StatePicker({
  destinations,
  value,
  onChange,
  className,
}: StatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")

  const stats = React.useMemo(() => getStateStats(destinations), [destinations])
  // Build a list of every state that exists in the catalogue, fall back to the
  // canonical INDIAN_STATES list ordering for ones with zero destinations.
  const allStates = React.useMemo(() => {
    const fromData = [...stats.keys()]
    const fromConst = INDIAN_STATES.filter((s) => s !== "All States")
    const merged = Array.from(new Set([...fromData, ...fromConst]))
    return merged
  }, [stats])

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return allStates
    return allStates.filter((s) => {
      const meta = STATE_META[s]
      const hay = `${s} ${meta?.tagline ?? ""} ${meta?.region ?? ""}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [allStates, q])

  // Group by region for nicer scanning when no search query is present.
  const grouped = React.useMemo(() => {
    if (q.trim()) return null
    const map = new Map<string, string[]>()
    for (const s of filtered) {
      const region = STATE_META[s]?.region ?? "Other"
      const list = map.get(region) ?? []
      list.push(s)
      map.set(region, list)
    }
    // Sort each group by destination count desc, then alpha
    for (const list of map.values()) {
      list.sort((a, b) => {
        const ca = stats.get(a)?.count ?? 0
        const cb = stats.get(b)?.count ?? 0
        if (ca !== cb) return cb - ca
        return a.localeCompare(b)
      })
    }
    const ordered: Array<[string, string[]]> = []
    for (const r of REGION_ORDER) {
      const list = map.get(r)
      if (list?.length) ordered.push([r, list])
    }
    return ordered
  }, [filtered, q, stats])

  const selectedMeta = value ? STATE_META[value] : undefined
  const selectedCount = value ? stats.get(value)?.count ?? 0 : 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full justify-between gap-2 px-3 font-normal",
            value && "border-primary/40 bg-primary/5",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-base leading-none" aria-hidden>
              {selectedMeta?.emoji ?? "📍"}
            </span>
            <span className="truncate text-sm">
              {value ?? "All states"}
            </span>
            {value && selectedCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {selectedCount}
              </span>
            )}
          </span>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(720px,calc(100vw-2rem))] p-0"
      >
        <div className="border-b border-border/60 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search states, vibes, regions…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} states</span>
            {value && (
              <button
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="font-medium text-primary hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {/* "All states" tile sits at top */}
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              "mb-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
              !value && "border-primary/40 bg-primary/5",
            )}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-base">
              ✨
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">All states</span>
              <span className="block text-xs text-muted-foreground">
                Browse every gem across India
              </span>
            </span>
            {!value && <Check className="h-4 w-4 text-primary" />}
          </button>

          {grouped ? (
            grouped.map(([region, states]) => (
              <div key={region} className="mb-4 last:mb-0">
                <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {region}
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {states.map((s) => (
                    <StateTile
                      key={s}
                      state={s}
                      count={stats.get(s)?.count ?? 0}
                      avgRating={stats.get(s)?.avgRating ?? 0}
                      selected={value === s}
                      onSelect={() => {
                        onChange(s)
                        setOpen(false)
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {filtered.length === 0 ? (
                <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                  No states match “{q}”.
                </p>
              ) : (
                filtered.map((s) => (
                  <StateTile
                    key={s}
                    state={s}
                    count={stats.get(s)?.count ?? 0}
                    avgRating={stats.get(s)?.avgRating ?? 0}
                    selected={value === s}
                    onSelect={() => {
                      onChange(s)
                      setOpen(false)
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface StateTileProps {
  state: string
  count: number
  avgRating: number
  selected: boolean
  onSelect: () => void
}

function StateTile({ state, count, avgRating, selected, onSelect }: StateTileProps) {
  const meta = STATE_META[state]
  const empty = count === 0
  return (
    <button
      onClick={onSelect}
      disabled={empty}
      className={cn(
        "group relative flex h-full items-start gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left transition-all",
        selected
          ? "border-primary/50 bg-primary/5 shadow-soft"
          : "border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft",
        empty && "opacity-50 hover:translate-y-0 hover:shadow-none",
      )}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-lg leading-none"
        aria-hidden
      >
        {meta?.emoji ?? "📍"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{state}</span>
          {selected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </span>
        <span className="line-clamp-1 text-[11px] text-muted-foreground">
          {meta?.tagline ?? "Hidden destinations across the state."}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5",
              empty
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            {count} {count === 1 ? "gem" : "gems"}
          </span>
          {avgRating > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
