"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  CalendarRange,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  Heart,
  IndianRupee,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Plus,
  Scale,
  Search,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Wand2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DestinationImage } from "@/components/destination-image"
import { StatePicker } from "@/components/state-picker"
import { canonicalState } from "@/lib/india-geo"
import { IndiaMap } from "@/components/india-map"
import {
  BUDGET_RANGES,
  LOCATION_TYPES,
  STATE_META,
  SMART_QUERY_IDEAS,
  WEATHER_CONDITIONS,
  addSaveTo,
  detectSearchIntent,
  getAllDestinations,
  getDidYouMean,
  getRecommendations,
  googleMapsUrl,
  monthName,
  parseBestMonths,
  pushSearchHistory,
  rankDestinations,
  readLikes,
  readSaves,
  readSearchHistory,
  removeSaveFrom,
  toggleLike,
  type Budget,
  type Destination,
  type LocationType,
  type Recommendation,
  type Saves,
  type SortMode,
  type Weather,
} from "@/lib/destinations"

const TYPE_META: Record<
  LocationType | "All",
  { label: string; emoji: string; tone: string }
> = {
  All:         { label: "All",       emoji: "✨", tone: "from-primary/20 to-secondary/20" },
  Adventurous: { label: "Adventure", emoji: "🏔️", tone: "from-emerald-500/20 to-teal-500/20" },
  Calm:        { label: "Calm",      emoji: "🌿", tone: "from-green-400/20 to-emerald-500/20" },
  Cultural:    { label: "Culture",   emoji: "🛕", tone: "from-amber-500/20 to-orange-500/20" },
  Spiritual:   { label: "Spiritual", emoji: "🕉️", tone: "from-violet-500/20 to-fuchsia-500/20" },
  Beach:       { label: "Beach",     emoji: "🏝️", tone: "from-cyan-500/20 to-sky-500/20" },
  Historical:  { label: "Historical",emoji: "🏛️", tone: "from-rose-500/20 to-orange-500/20" },
}

interface Filters {
  type: LocationType | null
  weather: Weather | null
  state: string | null
  budget: Budget | null
  query: string
  month: number | null
  minRating: number | null
  sort: SortMode
}

const initialFilters: Filters = {
  type: null,
  weather: null,
  state: null,
  budget: null,
  query: "",
  month: null,
  minRating: null,
  sort: "relevance",
}

const WEATHER_META: Record<Weather, { emoji: string; tone: string }> = {
  Hot:   { emoji: "🔥", tone: "from-orange-500/15 to-red-500/15" },
  Cold:  { emoji: "🥶", tone: "from-sky-500/15 to-indigo-500/15" },
  Warm:  { emoji: "🌞", tone: "from-amber-400/15 to-orange-500/15" },
  Rainy: { emoji: "🌧️", tone: "from-slate-500/15 to-blue-500/15" },
  Mild:  { emoji: "🌤️", tone: "from-emerald-400/15 to-teal-500/15" },
  Snowy: { emoji: "❄️", tone: "from-cyan-300/20 to-blue-500/15" },
}

const BUDGET_META: Record<Budget, { tier: string; tone: string }> = {
  "₹5K-10K":  { tier: "₹",      tone: "from-emerald-500/15 to-emerald-600/10" },
  "₹8K-15K":  { tier: "₹₹",     tone: "from-emerald-500/15 to-lime-500/10" },
  "₹10K-20K": { tier: "₹₹",     tone: "from-amber-500/15 to-orange-500/10" },
  "₹15K-25K": { tier: "₹₹₹",    tone: "from-orange-500/15 to-rose-500/10" },
  "₹20K-30K": { tier: "₹₹₹",    tone: "from-rose-500/15 to-red-500/10" },
  "₹30K-50K": { tier: "₹₹₹₹",   tone: "from-fuchsia-500/15 to-rose-500/10" },
  "₹50K+":    { tier: "₹₹₹₹₹",  tone: "from-violet-500/15 to-fuchsia-500/10" },
}

const RATING_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "Any",   value: 0 },
  { label: "4.0+",  value: 4.0 },
  { label: "4.3+",  value: 4.3 },
  { label: "4.5+",  value: 4.5 },
  { label: "4.7+",  value: 4.7 },
]

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "relevance", label: "Best match" },
  { value: "rating",    label: "Top rated" },
  { value: "name",      label: "A → Z" },
]

export default function ExplorePage() {
  const router = useRouter()
  const [destinations, setDestinations] = React.useState<Destination[]>([])
  const [filters, setFilters] = React.useState<Filters>(initialFilters)
  const [likes, setLikes] = React.useState<number[]>([])
  const [saves, setSaves] = React.useState<Saves>({})

  // View mode for Explore — grid (default) or stylized India map
  const [viewMode, setViewMode] = React.useState<"grid" | "map">("grid")
  // Compare-up-to-3 ids
  const [compareIds, setCompareIds] = React.useState<number[]>([])
  const [compareOpen, setCompareOpen] = React.useState(false)
  // Surprise-me reveal state
  const [surpriseId, setSurpriseId] = React.useState<number | null>(null)
  const [surpriseSpinning, setSurpriseSpinning] = React.useState(false)

  React.useEffect(() => {
    setDestinations(getAllDestinations())
    setLikes(readLikes())
    setSaves(readSaves())
  }, [])

  // Persist search to history (debounced)
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      pushSearchHistory({
        query: filters.query,
        type: filters.type,
        state: filters.state,
        budget: filters.budget,
      })
    }, 800)
    return () => window.clearTimeout(t)
  }, [filters])

  const { ranked, relaxed } = React.useMemo(
    () => rankDestinations(destinations, filters),
    [destinations, filters],
  )

  // Smart-search affordances — intent badge + did-you-mean
  const intent = React.useMemo(
    () => detectSearchIntent(filters.query),
    [filters.query],
  )
  const didYouMean = React.useMemo(() => {
    if (filters.query.trim().length < 3) return []
    if (ranked.length >= 3) return []
    return getDidYouMean(destinations, filters.query, 3)
  }, [destinations, filters.query, ranked.length])

  // Compact "thinking" feedback so search feels alive when a user is typing.
  const [searchPulse, setSearchPulse] = React.useState(false)
  // Reveal smart-search "Try" pills only when the search input is focused
  // (or the user has actually typed something).
  const [searchFocused, setSearchFocused] = React.useState(false)
  // Hide Weather + Budget chip rows behind a single "More filters" toggle.
  const [moreFiltersOpen, setMoreFiltersOpen] = React.useState(false)
  // Auto-open whenever a hidden filter is active so it's not hard to find.
  React.useEffect(() => {
    if (filters.weather || filters.budget) setMoreFiltersOpen(true)
  }, [filters.weather, filters.budget])
  React.useEffect(() => {
    if (!filters.query) {
      setSearchPulse(false)
      return
    }
    setSearchPulse(true)
    const t = window.setTimeout(() => setSearchPulse(false), 280)
    return () => window.clearTimeout(t)
  }, [filters.query])

  const recommendations: Recommendation[] = React.useMemo(() => {
    if (destinations.length === 0) return []
    return getRecommendations(destinations, readSearchHistory(), { lookahead: 3, limit: 6 })
  }, [destinations, filters]) // re-evaluate when filters change to incorporate latest history

  const total = destinations.length
  const activeChips = [
    filters.type ? { key: "type" as const, label: filters.type } : null,
    filters.weather
      ? { key: "weather" as const, label: `${WEATHER_META[filters.weather].emoji} ${filters.weather}` }
      : null,
    filters.state
      ? {
          key: "state" as const,
          label: `${STATE_META[filters.state]?.emoji ?? "📍"} ${filters.state}`,
        }
      : null,
    filters.budget ? { key: "budget" as const, label: filters.budget } : null,
    filters.month
      ? { key: "month" as const, label: `Best in ${MONTHS_SHORT[filters.month - 1]}` }
      : null,
    filters.minRating
      ? { key: "minRating" as const, label: `★ ${filters.minRating.toFixed(1)}+` }
      : null,
  ].filter(Boolean) as Array<{ key: keyof Filters; label: string }>

  const advancedActive =
    filters.month !== null ||
    (filters.minRating !== null && filters.minRating > 0) ||
    (filters.sort !== "relevance")

  const hasFilters =
    activeChips.length > 0 || filters.query.length > 0 || advancedActive

  const clearAll = () => setFilters(initialFilters)
  const removeChip = (key: keyof Filters) =>
    setFilters((p) => ({ ...p, [key]: key === "sort" ? "relevance" : null }) as Filters)

  // ── Surprise Me ─────────────────────────────────────────────────────
  const onSurpriseMe = () => {
    const pool = ranked.length > 0 ? ranked.map((r) => r.destination) : destinations
    if (pool.length === 0) return
    setSurpriseSpinning(true)
    let ticks = 0
    const total = 12
    const interval = window.setInterval(() => {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      setSurpriseId(pick.id)
      ticks += 1
      if (ticks >= total) {
        window.clearInterval(interval)
        setSurpriseSpinning(false)
      }
    }, 70)
  }
  const surpriseDest = React.useMemo(
    () => (surpriseId ? destinations.find((d) => d.id === surpriseId) ?? null : null),
    [destinations, surpriseId],
  )

  // ── Compare-up-to-3 ─────────────────────────────────────────────────
  const toggleCompare = (id: number) => {
    setCompareIds((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id)
      if (p.length >= 3) return p
      return [...p, id]
    })
    setCompareOpen(true)
  }
  const compareDests = React.useMemo(
    () =>
      compareIds
        .map((id) => destinations.find((d) => d.id === id))
        .filter(Boolean) as Destination[],
    [compareIds, destinations],
  )

  const onToggleLike = (id: number) => {
    setLikes(toggleLike(id))
  }
  const onSaveTo = (id: number, theme: string) => {
    setSaves(addSaveTo(theme, id))
  }
  const onUnsaveFrom = (id: number, theme: string) => {
    setSaves(removeSaveFrom(theme, id))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm" aria-hidden />
        <div className="absolute inset-0 bg-grid-pattern text-foreground/5" aria-hidden />

        <div className="container relative mx-auto px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {total} hand-picked Indian gems
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Discover India&apos;s{" "}
                <span className="text-gradient-brand">best-kept secrets</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Search naturally — “comfortable place in Himachal under 15k” or
                “monsoon spiritual trip” — combine filters, save what you love.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSurpriseMe}
                disabled={surpriseSpinning || ranked.length === 0}
                className={cn(
                  "group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 px-4 text-sm font-semibold text-white shadow-soft-lg transition-all hover:scale-[1.03] hover:shadow-xl disabled:opacity-70",
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.45),transparent_60%)] opacity-0 transition group-hover:opacity-100"
                />
                <Shuffle
                  className={cn("h-4 w-4 relative z-10", surpriseSpinning && "animate-spin")}
                />
                <span className="relative z-10">Surprise me</span>
              </button>
              <Link href="/trip-planner">
                <Button variant="outline" className="gap-2 h-10">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Plan a trip
                </Button>
              </Link>
              <Link href="/passport">
                <Button variant="outline" className="gap-2 h-10">
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                  Passport
                </Button>
              </Link>
              <SavedSheet
                saves={saves}
                destinations={destinations}
                onUnsave={onUnsaveFrom}
              />
              <Link href="/add-destination">
                <Button variant="outline" className="gap-2 h-10">
                  <Plus className="h-4 w-4" />
                  Share a gem
                </Button>
              </Link>
            </div>
          </div>

          {/* Search + filters */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-soft-lg backdrop-blur-md">
            {/* Row 1 — search + state + sort + advanced toggle */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <FilterLabel>Smart search</FilterLabel>
                <div className="relative">
                  <Search
                    className={cn(
                      "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors",
                      searchPulse && "text-primary animate-pulse",
                    )}
                  />
                  <Input
                    value={filters.query}
                    onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                    placeholder="Try: 'cold place near snow under 20k' or 'Himachl trek'"
                    className="h-11 pl-10 pr-10"
                  />
                  {filters.query && (
                    <button
                      onClick={() => setFilters((p) => ({ ...p, query: "" }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Smart-search affordances */}
                {filters.query.trim().length >= 2 && intent && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    <Wand2 className="h-3 w-3" />
                    {intent.summary}
                  </div>
                )}
                {filters.query.trim().length >= 3 && didYouMean.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Did you mean</span>
                    {didYouMean.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, query: s }))}
                        className="rounded-full border border-border bg-background px-2 py-0.5 text-foreground transition hover:border-primary/40 hover:bg-primary/10"
                      >
                        {s}
                      </button>
                    ))}
                    ?
                  </div>
                )}
                {filters.query.trim().length === 0 && searchFocused && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground animate-fade-in">
                    <span className="font-semibold uppercase tracking-wider">Try</span>
                    {SMART_QUERY_IDEAS.slice(0, 5).map((s) => (
                      <button
                        key={s.query}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setFilters((p) => ({ ...p, query: s.query }))}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-foreground/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                      >
                        <span aria-hidden>{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-4">
                <FilterLabel>State</FilterLabel>
                <StatePicker
                  destinations={destinations}
                  value={filters.state}
                  onChange={(s) => setFilters((p) => ({ ...p, state: s }))}
                />
              </div>

              <div className="md:col-span-2">
                <FilterLabel>Sort by</FilterLabel>
                <Select
                  value={filters.sort}
                  onValueChange={(v) =>
                    setFilters((p) => ({ ...p, sort: v as SortMode }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <Button
                  variant="outline"
                  className="h-11 w-full"
                  onClick={clearAll}
                  disabled={!hasFilters}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Row 2 — Type chips */}
            <div className="border-t border-border/60 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vibe
                </span>
                {(["All", ...LOCATION_TYPES] as const).map((t) => {
                  const active = (t === "All" && !filters.type) || filters.type === t
                  const meta = TYPE_META[t]
                  const count =
                    t === "All"
                      ? destinations.length
                      : destinations.filter((d) => d.type === t).length
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          type: t === "All" ? null : (t as LocationType),
                        }))
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                        active
                          ? "border-primary/30 bg-gradient-to-r text-foreground shadow-soft " +
                              meta.tone
                          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      <span aria-hidden>{meta.emoji}</span>
                      {meta.label}
                      <span
                        className={cn(
                          "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                          active
                            ? "bg-foreground/10 text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* More filters — collapses Weather + Budget behind a single toggle */}
            <div className="border-t border-border/60">
              <button
                type="button"
                onClick={() => setMoreFiltersOpen((p) => !p)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:bg-muted/30 sm:px-5"
                aria-expanded={moreFiltersOpen}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  More filters
                  {(filters.weather || filters.budget) && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal text-primary">
                      {(filters.weather ? 1 : 0) + (filters.budget ? 1 : 0)} active
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    moreFiltersOpen && "rotate-180",
                  )}
                />
              </button>
              {moreFiltersOpen && (
                <div className="animate-fade-in">
                  {/* Weather chips */}
                  <div className="border-t border-border/60 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Weather
                      </span>
                      <ChipPill
                        active={!filters.weather}
                        onClick={() => setFilters((p) => ({ ...p, weather: null }))}
                        label="Any"
                      />
                      {WEATHER_CONDITIONS.map((w) => {
                        const meta = WEATHER_META[w]
                        const count = destinations.filter((d) => d.weather.includes(w)).length
                        return (
                          <ChipPill
                            key={w}
                            active={filters.weather === w}
                            onClick={() =>
                              setFilters((p) => ({
                                ...p,
                                weather: p.weather === w ? null : w,
                              }))
                            }
                            label={w}
                            emoji={meta.emoji}
                            tone={meta.tone}
                            count={count}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Budget chips */}
                  <div className="border-t border-border/60 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Budget
                      </span>
                      <ChipPill
                        active={!filters.budget}
                        onClick={() => setFilters((p) => ({ ...p, budget: null }))}
                        label="Any"
                      />
                      {BUDGET_RANGES.map((b) => {
                        const meta = BUDGET_META[b]
                        const count = destinations.filter((d) => d.budget === b).length
                        return (
                          <ChipPill
                            key={b}
                            active={filters.budget === b}
                            onClick={() =>
                              setFilters((p) => ({
                                ...p,
                                budget: p.budget === b ? null : b,
                              }))
                            }
                            label={b}
                            tone={meta.tone}
                            count={count}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced panel toggle + content */}
            <AdvancedPanel
              advancedActive={advancedActive}
              filters={filters}
              setFilters={setFilters}
              destinations={destinations}
            />
          </div>

          {/* Active filters + counts */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {!hasFilters ? (
                <span className="text-sm text-muted-foreground">No filters applied.</span>
              ) : (
                <>
                  {filters.query && (
                    <Chip
                      label={`“${filters.query}”`}
                      onRemove={() => setFilters((p) => ({ ...p, query: "" }))}
                    />
                  )}
                  {activeChips.map((c) => (
                    <Chip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {relaxed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Wand2 className="h-3 w-3" />
                  Filters relaxed for more matches
                </span>
              )}
              <span>
                Showing <span className="font-semibold text-foreground">{ranked.length}</span> of{" "}
                <span className="font-semibold text-foreground">{total}</span>
              </span>
              {/* View toggle: Grid ↔ Map */}
              <div className="ml-1 inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition",
                    viewMode === "grid"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition",
                    viewMode === "map"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={viewMode === "map"}
                >
                  <MapIcon className="h-3.5 w-3.5" /> Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surprise-me reveal banner */}
      {surpriseDest && (
        <SurpriseRevealBanner
          destination={surpriseDest}
          spinning={surpriseSpinning}
          onDismiss={() => setSurpriseId(null)}
          onReroll={onSurpriseMe}
        />
      )}

      {/* Results — Grid or Map */}
      <main className={cn("container mx-auto flex-1 px-4 pt-8 sm:px-6 lg:px-8", compareIds.length > 0 ? "pb-44" : "pb-20")}>
        {ranked.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ranked.map((r, i) => (
                <DestinationCard
                  key={r.destination.id}
                  destination={r.destination}
                  index={i}
                  liked={likes.includes(r.destination.id)}
                  themesForId={Object.entries(saves)
                    .filter(([, ids]) => ids.includes(r.destination.id))
                    .map(([n]) => n)}
                  allThemes={Object.keys(saves)}
                  onToggleLike={() => onToggleLike(r.destination.id)}
                  onSave={(theme) => onSaveTo(r.destination.id, theme)}
                  onUnsave={(theme) => onUnsaveFrom(r.destination.id, theme)}
                  inCompare={compareIds.includes(r.destination.id)}
                  compareDisabled={compareIds.length >= 3 && !compareIds.includes(r.destination.id)}
                  onToggleCompare={() => toggleCompare(r.destination.id)}
                />
              ))}
            </div>
          ) : (
            <IndiaMapView
              destinations={ranked.map((r) => r.destination)}
              selectedState={filters.state}
              onSelectState={(s) => setFilters((p) => ({ ...p, state: s }))}
              onPickDestination={(id) => router.push(`/destination/${id}`)}
            />
          )
        ) : (
          <EmptyState onClear={clearAll} />
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && viewMode === "grid" && (
          <RecommendationStrip
            recs={recommendations}
            likes={likes}
            saves={saves}
            onToggleLike={onToggleLike}
            onSave={onSaveTo}
            onUnsave={onUnsaveFrom}
          />
        )}
      </main>

      {/* Compare drawer — pinned to bottom */}
      {compareIds.length > 0 && (
        <CompareDrawer
          destinations={compareDests}
          open={compareOpen}
          onOpenChange={setCompareOpen}
          onRemove={(id) => setCompareIds((p) => p.filter((x) => x !== id))}
          onClear={() => setCompareIds([])}
        />
      )}

      <Footer />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────
// UI primitives
// ───────────────────────────────────────────────────────────────────────

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </label>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-soft">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

interface ChipPillProps {
  active: boolean
  onClick: () => void
  label: string
  emoji?: string
  tone?: string
  count?: number
}

function ChipPill({ active, onClick, label, emoji, tone, count }: ChipPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary/30 bg-gradient-to-r text-foreground shadow-soft " + (tone ?? "from-primary/15 to-secondary/15")
          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
        count === 0 && !active && "opacity-50",
      )}
      disabled={count === 0 && !active}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            active
              ? "bg-foreground/10 text-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Advanced filter panel — collapsible drawer with month, rating filters
// ───────────────────────────────────────────────────────────────────────

interface AdvancedPanelProps {
  advancedActive: boolean
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  destinations: Destination[]
}

function AdvancedPanel({
  advancedActive,
  filters,
  setFilters,
  destinations,
}: AdvancedPanelProps) {
  const [open, setOpen] = React.useState(advancedActive)
  React.useEffect(() => {
    if (advancedActive) setOpen(true)
  }, [advancedActive])

  // Pre-compute count of destinations whose bestTime window contains each
  // month so the month chips can show a quick-glance count.
  const monthCounts = React.useMemo(() => {
    const counts = new Array(12).fill(0)
    for (const d of destinations) {
      const months = parseBestMonths(d.bestTime)
      for (const m of months) counts[m - 1] += 1
    }
    return counts as number[]
  }, [destinations])

  return (
    <div className="border-t border-border/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/40 sm:px-5"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Advanced filters
          {advancedActive && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              On
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/60 bg-muted/30 px-4 py-4 sm:px-5">
          {/* Best month */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Best month to visit
              </span>
              {filters.month && (
                <button
                  onClick={() => setFilters((p) => ({ ...p, month: null }))}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {MONTHS_SHORT.map((m, i) => {
                const monthNum = i + 1
                const active = filters.month === monthNum
                const count = monthCounts[i]
                return (
                  <button
                    key={m}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        month: p.month === monthNum ? null : monthNum,
                      }))
                    }
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition-all",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary shadow-soft"
                        : "border-border bg-background text-foreground hover:border-primary/30",
                      count === 0 && !active && "opacity-40",
                    )}
                    disabled={count === 0 && !active}
                  >
                    <span>{m}</span>
                    <span
                      className={cn(
                        "text-[9px] font-medium tabular-nums",
                        active ? "text-primary/80" : "text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Min rating */}
          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Minimum rating
            </span>
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              {RATING_OPTIONS.map((opt) => {
                const active =
                  (opt.value === 0 && (filters.minRating === null || filters.minRating === 0)) ||
                  filters.minRating === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        minRating: opt.value === 0 ? null : opt.value,
                      }))
                    }
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.value > 0 && <Star className="h-3 w-3 fill-current" />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active sort indicator (mirrors the dropdown for clarity) */}
          {filters.sort !== "relevance" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              Sorting by{" "}
              <span className="font-semibold text-foreground">
                {SORT_OPTIONS.find((s) => s.value === filters.sort)?.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ───────────────────────────────────────────────────────────────────────
// Destination card
// ───────────────────────────────────────────────────────────────────────

interface CardProps {
  destination: Destination
  index?: number
  liked: boolean
  themesForId: string[]
  allThemes: string[]
  onToggleLike: () => void
  onSave: (theme: string) => void
  onUnsave: (theme: string) => void
  inCompare?: boolean
  compareDisabled?: boolean
  onToggleCompare?: () => void
}

function DestinationCard({
  destination: d,
  index = 0,
  liked,
  themesForId,
  allThemes,
  onToggleLike,
  onSave,
  onUnsave,
  inCompare = false,
  compareDisabled = false,
  onToggleCompare,
}: CardProps) {
  const meta = TYPE_META[d.type]
  const isSaved = themesForId.length > 0
  return (
    <Card
      className="group relative gap-0 overflow-hidden border-border/60 p-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
      style={{ animation: `fade-in-up 0.6s ${index * 30}ms both cubic-bezier(0.22, 1, 0.36, 1)` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <DestinationImage
          wikiTitle={d.wikiTitle}
          name={d.name}
          state={d.state}
          fallback={d.image}
          alt={d.name}
          className="h-full w-full transition-transform duration-700 group-hover:scale-110"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
        />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
              meta.tone,
              "border border-white/30 text-foreground",
            )}
          >
            <span aria-hidden>{meta.emoji}</span>
            {d.type}
          </span>
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              disabled={compareDisabled}
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              title={
                inCompare
                  ? "Pinned for compare"
                  : compareDisabled
                    ? "Compare is full (max 3)"
                    : "Add to compare"
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition",
                inCompare
                  ? "bg-primary text-primary-foreground shadow-soft ring-2 ring-primary/40"
                  : "bg-black/40 text-white hover:bg-black/60",
                compareDisabled && "opacity-50",
              )}
            >
              <Scale className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition",
              liked
                ? "bg-rose-500/95 text-white shadow-soft"
                : "bg-black/40 text-white hover:bg-black/60",
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>
          <SavePopover
            isSaved={isSaved}
            currentThemes={themesForId}
            allThemes={allThemes}
            onSave={onSave}
            onUnsave={onUnsave}
          />
        </div>

        <div className="absolute inset-x-3 bottom-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold leading-snug drop-shadow-md">{d.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {d.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/90">
            <span aria-hidden>{STATE_META[d.state]?.emoji ?? "📍"}</span>
            {d.state}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {d.description}
        </p>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
          <KeyFact icon={MapPin} label="Location" value={d.state} />
          <KeyFact icon={Sparkles} label="Theme" value={d.type} />
          <KeyFact
            icon={WeatherIcon}
            label="Weather"
            value={d.weather.slice(0, 2).join(" · ")}
          />
          <KeyFact icon={IndianRupee} label="Budget" value={d.budget.replace("₹", "")} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {d.tags.slice(0, 3).map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="bg-muted/60 text-[10px] font-medium text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {t}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5 text-primary" />
            {d.bestTime}
          </span>
          {themesForId.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <BookmarkCheck className="h-3 w-3" />
              {themesForId[0]}
              {themesForId.length > 1 && ` +${themesForId.length - 1}`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link href={`/destination/${d.id}`} className="contents">
            <Button className="w-full">
              View
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <a
            href={googleMapsUrl(d)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-muted"
          >
            <MapPin className="h-3.5 w-3.5" />
            Map
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </div>
      </div>
    </Card>
  )
}

function KeyFact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" />
        {label}
      </span>
      <span className="truncate text-xs font-medium text-foreground" title={value}>
        {value}
      </span>
    </div>
  )
}

function WeatherIcon({ className }: { className?: string }) {
  // small inline cloud-and-sun substitute to keep the import surface small
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="7" cy="7" r="3" />
      <path d="M14 18a4 4 0 1 0 0-8 6 6 0 0 0-11 2" />
    </svg>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Save-to-theme popover
// ───────────────────────────────────────────────────────────────────────

function SavePopover({
  isSaved,
  currentThemes,
  allThemes,
  onSave,
  onUnsave,
}: {
  isSaved: boolean
  currentThemes: string[]
  allThemes: string[]
  onSave: (theme: string) => void
  onUnsave: (theme: string) => void
}) {
  const [newTheme, setNewTheme] = React.useState("")
  const themeOptions = Array.from(new Set([...allThemes, "Wishlist", "Travel 2027", "Summer", "Winter"]))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={isSaved ? "Edit saved themes" : "Save"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition",
            isSaved
              ? "bg-primary/95 text-primary-foreground shadow-soft"
              : "bg-black/40 text-white hover:bg-black/60",
          )}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Save to a theme
        </p>
        <div className="mt-2 space-y-1">
          {themeOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No themes yet — create one below.</p>
          ) : (
            themeOptions.map((t) => {
              const checked = currentThemes.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => (checked ? onUnsave(t) : onSave(t))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition",
                    checked
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    {checked ? (
                      <BookmarkCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {t}
                  </span>
                  {checked && <span className="text-[10px] font-medium">Saved</span>}
                </button>
              )
            })
          )}
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            New theme
          </p>
          <form
            className="mt-1.5 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const t = newTheme.trim()
              if (!t) return
              onSave(t)
              setNewTheme("")
            }}
          >
            <Input
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              placeholder="e.g. Summer 2027"
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" className="h-8 px-2.5">
              Add
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Recommendations strip
// ───────────────────────────────────────────────────────────────────────

function RecommendationStrip({
  recs,
  likes,
  saves,
  onToggleLike,
  onSave,
  onUnsave,
}: {
  recs: Recommendation[]
  likes: number[]
  saves: Saves
  onToggleLike: (id: number) => void
  onSave: (id: number, theme: string) => void
  onUnsave: (id: number, theme: string) => void
}) {
  const now = new Date()
  const upcoming = monthName(((now.getMonth() + 1) % 12) + 1)
  return (
    <section className="mt-20">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Recommended for you
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Picks for {upcoming} & the next few months
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalised by your recent searches and what&apos;s in season right now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recs.map((rec, i) => {
          const d = rec.destination
          const themesForId = Object.entries(saves)
            .filter(([, ids]) => ids.includes(d.id))
            .map(([n]) => n)
          return (
            <Card
              key={d.id}
              className="group gap-0 overflow-hidden border-primary/15 bg-gradient-to-br from-card to-primary/5 p-0 shadow-soft"
              style={{ animation: `fade-in-up 0.6s ${i * 40}ms both cubic-bezier(0.22, 1, 0.36, 1)` }}
            >
              <div className="grid grid-cols-[140px_1fr]">
                <div className="relative h-full">
                  <DestinationImage
                    wikiTitle={d.wikiTitle}
                    name={d.name}
                    state={d.state}
                    fallback={d.image}
                    alt={d.name}
                    className="h-full w-full"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent to-background/10"
                  />
                </div>
                <div className="flex flex-col justify-between gap-2 p-4">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <CalendarRange className="h-3 w-3" />
                      Best in {monthName(rec.forMonth)}
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold leading-snug">{d.name}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      <span aria-hidden className="mr-0.5">
                        {STATE_META[d.state]?.emoji ?? "📍"}
                      </span>
                      {d.state} · {d.type} · {d.budget}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {d.description}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/destination/${d.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleLike(d.id)}
                        aria-label="Like"
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border transition",
                          likes.includes(d.id)
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                            : "border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Heart
                          className={cn("h-3.5 w-3.5", likes.includes(d.id) && "fill-current")}
                        />
                      </button>
                      <SavePopover
                        isSaved={themesForId.length > 0}
                        currentThemes={themesForId}
                        allThemes={Object.keys(saves)}
                        onSave={(t) => onSave(d.id, t)}
                        onUnsave={(t) => onUnsave(d.id, t)}
                      />
                      <a
                        href={googleMapsUrl(d)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open in Google Maps"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Saved sheet (browse by theme)
// ───────────────────────────────────────────────────────────────────────

function SavedSheet({
  saves,
  destinations,
  onUnsave,
}: {
  saves: Saves
  destinations: Destination[]
  onUnsave: (id: number, theme: string) => void
}) {
  const themes = Object.keys(saves).filter((t) => saves[t]?.length)
  const total = themes.reduce((acc, t) => acc + saves[t].length, 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Saved
          {total > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {total}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-md p-6">
        <SheetHeader className="p-0 pb-5">
          <SheetTitle>Your saved gems</SheetTitle>
          <SheetDescription>
            Saved by theme — perfect for trip-planning a few months out.
          </SheetDescription>
        </SheetHeader>

        {themes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">Nothing saved yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the bookmark on any card to file it under a theme like “Summer 2027”.
            </p>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
            {themes.map((t) => (
              <div key={t}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t}</h3>
                  <span className="text-xs text-muted-foreground">
                    {saves[t].length} saved
                  </span>
                </div>
                <ul className="mt-2 space-y-2">
                  {saves[t]
                    .map((id) => destinations.find((d) => d.id === id))
                    .filter(Boolean)
                    .map((d) => {
                      const dest = d as Destination
                      return (
                        <li
                          key={dest.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-soft"
                        >
                          <DestinationImage
                            wikiTitle={dest.wikiTitle}
                            name={dest.name}
                            state={dest.state}
                            fallback={dest.image}
                            alt={dest.name}
                            className="h-12 w-16 shrink-0 rounded-md"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/destination/${dest.id}`}
                              className="block truncate text-sm font-medium hover:text-primary"
                            >
                              {dest.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {dest.state} · {dest.type} · {dest.budget}
                            </p>
                          </div>
                          <a
                            href={googleMapsUrl(dest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Open in Maps"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => onUnsave(dest.id, t)}
                            aria-label="Remove"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Empty state
// ───────────────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No gems match those filters</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Try a less specific search — “Himachal under 15k”, “monsoon spiritual”, or just
        “beach”.
      </p>
      <Button onClick={onClear} variant="outline" className="mt-6">
        Reset filters
      </Button>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Surprise-me reveal banner
// ───────────────────────────────────────────────────────────────────────

function SurpriseRevealBanner({
  destination,
  spinning,
  onDismiss,
  onReroll,
}: {
  destination: Destination
  spinning: boolean
  onDismiss: () => void
  onReroll: () => void
}) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "relative -mt-2 mb-2 overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-rose-500/10 to-amber-400/10 p-4 sm:p-5 shadow-soft",
          "animate-fade-in-up",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(244,114,182,0.25),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(251,191,36,0.2),transparent_55%)]"
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ring-fuchsia-500/30">
            <DestinationImage
              wikiTitle={destination.wikiTitle}
              name={destination.name}
              state={destination.state}
              fallback={destination.image}
              alt={destination.name}
              className={cn("h-full w-full transition", spinning && "animate-pulse blur-[1px]")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300">
              <Sparkles className="h-3 w-3" />
              {spinning ? "Picking your gem…" : "Your surprise gem"}
            </span>
            <h3 className="mt-1 text-lg font-semibold leading-tight">
              {destination.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {STATE_META[destination.state]?.emoji} {destination.state}
              </span>
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {destination.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/destination/${destination.id}`}>
              <Button className="gap-1.5 shadow-soft">
                Take me there
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button variant="outline" onClick={onReroll} className="gap-1.5" disabled={spinning}>
              <Shuffle className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
              Reroll
            </Button>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Real India map view
// ───────────────────────────────────────────────────────────────────────

function IndiaMapView({
  destinations,
  selectedState,
  onSelectState,
  onPickDestination,
}: {
  destinations: Destination[]
  selectedState: string | null
  onSelectState: (state: string | null) => void
  onPickDestination: (id: number) => void
}) {
  const [hoverState, setHoverState] = React.useState<string | null>(null)

  // Group destinations by canonical state name (handles spelling variants).
  const byState = React.useMemo(() => {
    const m = new Map<string, Destination[]>()
    for (const d of destinations) {
      const key = canonicalState(d.state)
      const arr = m.get(key) ?? []
      arr.push(d)
      m.set(key, arr)
    }
    return m
  }, [destinations])

  const countsByState = React.useMemo(() => {
    const out: Record<string, number> = {}
    for (const [k, v] of byState) out[k] = v.length
    return out
  }, [byState])

  const maxCount = React.useMemo(() => {
    let m = 0
    for (const arr of byState.values()) if (arr.length > m) m = arr.length
    return m
  }, [byState])

  // Map UI handles canonical names; persist onto filters using whichever
  // matching gem-state spelling exists, falling back to the canonical key.
  const handleSelect = (canonical: string | null) => {
    if (!canonical) {
      onSelectState(null)
      return
    }
    const original =
      destinations.find((d) => canonicalState(d.state) === canonical)?.state ??
      canonical
    onSelectState(original)
  }

  const selectedCanonical = selectedState ? canonicalState(selectedState) : null
  const hoverGems = hoverState ? byState.get(hoverState) ?? [] : []

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Real India map */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-soft-lg">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(circle_at_75%_85%,rgba(244,114,182,0.14),transparent_55%)]"
        />
        <div className="relative w-full p-5">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-300/80">
            <span>India · Heat map</span>
            <span>{destinations.length} gems</span>
          </div>

          <IndiaMap
            mode="heat"
            countsByState={countsByState}
            maxCount={maxCount}
            selectedState={selectedCanonical}
            onSelectState={handleSelect}
            onHoverState={setHoverState}
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300/85">
            <div className="inline-flex items-center gap-2">
              <span>0</span>
              <span
                className="h-2.5 w-32 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgb(16,185,129), rgb(251,191,36), rgb(244,63,94))",
                }}
              />
              <span>{maxCount || 0}+ gems / state</span>
            </div>
            <span className="text-slate-400/70">Click a state · scroll to zoom</span>
          </div>
        </div>

        {/* Hover preview */}
        {hoverState && hoverGems.length > 0 && (
          <div className="pointer-events-none absolute right-4 top-4 w-64 rounded-xl border border-white/10 bg-slate-900/85 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md">
            <div className="font-semibold text-amber-300">
              {stateMetaFor(hoverState)?.emoji} {hoverState}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-300">
              {hoverGems.length} gem{hoverGems.length === 1 ? "" : "s"}
              {stateMetaFor(hoverState)?.tagline
                ? ` · ${stateMetaFor(hoverState)?.tagline}`
                : ""}
            </div>
            <ul className="mt-2 space-y-1 text-[11px]">
              {hoverGems.slice(0, 3).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{d.name}</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {d.rating.toFixed(1)}
                  </span>
                </li>
              ))}
              {hoverGems.length > 3 && (
                <li className="text-slate-400">+ {hoverGems.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Side panel — gems in selected state, or top states */}
      <aside className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-soft backdrop-blur-md">
        {selectedCanonical ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">
                <span aria-hidden className="mr-1.5">
                  {stateMetaFor(selectedCanonical)?.emoji ?? "📍"}
                </span>
                {selectedCanonical}
              </h3>
              <button
                type="button"
                onClick={() => onSelectState(null)}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Clear
              </button>
            </div>
            {stateMetaFor(selectedCanonical)?.tagline && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {stateMetaFor(selectedCanonical)?.tagline}
              </p>
            )}
            <ul className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {(byState.get(selectedCanonical) ?? []).map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onPickDestination(d.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent bg-muted/30 px-3 py-2 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span className="min-w-0 truncate font-medium">{d.name}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {d.rating.toFixed(1)}
                    </span>
                  </button>
                </li>
              ))}
              {(byState.get(selectedCanonical) ?? []).length === 0 && (
                <li className="rounded-lg bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
                  No gems match the current filters here.
                </li>
              )}
            </ul>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Top states
            </h3>
            <ul className="mt-4 max-h-[560px] space-y-1 overflow-y-auto pr-1">
              {[...byState.entries()]
                .sort((a, b) => b[1].length - a[1].length)
                .map(([state, gems]) => (
                  <li key={state}>
                    <button
                      type="button"
                      onClick={() => handleSelect(state)}
                      onMouseEnter={() => setHoverState(state)}
                      onMouseLeave={() => setHoverState(null)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden className="text-base">
                          {stateMetaFor(state)?.emoji ?? "📍"}
                        </span>
                        <span className="truncate">{state}</span>
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {gems.length}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
            <p className="mt-3 rounded-lg bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              Tip: click any state on the map · scroll to zoom.
            </p>
          </>
        )}
      </aside>
    </div>
  )
}

/**
 * STATE_META is keyed by the gem-catalogue spelling. Some canonical map
 * names ("Jammu & Kashmir / Ladakh") aren't direct keys, so split on " / "
 * and try each piece before falling back to undefined.
 */
function stateMetaFor(canonical: string): (typeof STATE_META)[string] | undefined {
  if (STATE_META[canonical]) return STATE_META[canonical]
  for (const piece of canonical.split(" / ")) {
    if (STATE_META[piece]) return STATE_META[piece]
  }
  return undefined
}

// ───────────────────────────────────────────────────────────────────────
// Compare-up-to-3 drawer
// ───────────────────────────────────────────────────────────────────────

function CompareDrawer({
  destinations,
  open,
  onOpenChange,
  onRemove,
  onClear,
}: {
  destinations: Destination[]
  open: boolean
  onOpenChange: (b: boolean) => void
  onRemove: (id: number) => void
  onClear: () => void
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-300",
        open ? "translate-y-0" : "translate-y-[calc(100%-58px)]",
      )}
    >
      <div className="container mx-auto px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-soft-lg backdrop-blur-xl">
          {/* Handle */}
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            className="flex w-full items-center justify-between gap-3 border-b border-border/40 px-4 py-3 text-left transition hover:bg-muted/40"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Scale className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">
                Compare ({destinations.length}/3)
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {open ? "Tap to collapse" : "Tap to expand"}
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
                className="text-xs font-medium text-muted-foreground transition hover:text-destructive"
              >
                Clear all
              </button>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")}
              />
            </span>
          </button>

          {/* Body */}
          <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-3">
            {destinations.map((d) => (
              <CompareCard key={d.id} destination={d} onRemove={() => onRemove(d.id)} />
            ))}
            {Array.from({ length: 3 - destinations.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground"
              >
                Pin another gem
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareCard({
  destination: d,
  onRemove,
}: {
  destination: Destination
  onRemove: () => void
}) {
  const meta = TYPE_META[d.type]
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-soft">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <DestinationImage
          wikiTitle={d.wikiTitle}
          name={d.name}
          state={d.state}
          fallback={d.image}
          alt={d.name}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from compare"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="absolute inset-x-3 bottom-2 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold leading-tight drop-shadow">
              {d.name}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-md">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {d.rating.toFixed(1)}
            </span>
          </div>
          <div className="text-[11px] text-white/85">
            {STATE_META[d.state]?.emoji} {d.state}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-3 text-[11px]">
        <CompareRow label="Vibe" value={`${meta.emoji} ${d.type}`} />
        <CompareRow label="Budget" value={d.budget} />
        <CompareRow label="Best time" value={d.bestTime} />
        <CompareRow label="Weather" value={d.weather.join(" · ")} />
      </div>
      <div className="px-3 pb-3">
        <Link href={`/destination/${d.id}`} className="contents">
          <Button size="sm" variant="outline" className="w-full gap-1.5">
            View details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-[11px] font-medium text-foreground" title={value}>
        {value}
      </span>
    </div>
  )
}
