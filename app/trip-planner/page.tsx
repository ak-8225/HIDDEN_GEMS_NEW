"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarRange,
  Cloud,
  Compass,
  IndianRupee,
  MapPin,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DestinationImage } from "@/components/destination-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BUDGET_RANGES,
  INDIAN_STATES,
  LOCATION_TYPES,
  STATE_META,
  WEATHER_CONDITIONS,
  buildItinerary,
  getAllDestinations,
  googleMapsUrl,
  monthName,
  type Budget,
  type Destination,
  type Itinerary,
  type LocationType,
  type TripPreferences,
  type Weather,
} from "@/lib/destinations"

const VIBE_OPTIONS: Array<{ value: LocationType; label: string; emoji: string }> = [
  { value: "Adventurous", label: "Adventure",  emoji: "🏔️" },
  { value: "Calm",        label: "Calm",       emoji: "🌿" },
  { value: "Cultural",    label: "Culture",    emoji: "🛕" },
  { value: "Spiritual",   label: "Spiritual",  emoji: "🕉️" },
  { value: "Beach",       label: "Beach",      emoji: "🏝️" },
  { value: "Historical",  label: "Historical", emoji: "🏛️" },
]

export default function TripPlannerPage() {
  const [destinations, setDestinations] = React.useState<Destination[]>([])
  const [days, setDays] = React.useState(5)
  const [budget, setBudget] = React.useState<Budget | "">("₹15K-25K")
  const [vibe, setVibe] = React.useState<LocationType | "">("")
  const [weather, setWeather] = React.useState<Weather | "">("")
  const [startState, setStartState] = React.useState<string>("")
  const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1)
  const [itinerary, setItinerary] = React.useState<Itinerary | null>(null)
  const [building, setBuilding] = React.useState(false)

  React.useEffect(() => {
    setDestinations(getAllDestinations())
  }, [])

  const onPlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (destinations.length === 0) return
    setBuilding(true)
    // Tiny artificial delay for the "magic" reveal animation
    setTimeout(() => {
      const prefs: TripPreferences = {
        days,
        budget: budget === "" ? null : budget,
        vibe: vibe === "" ? null : vibe,
        weather: weather === "" ? null : weather,
        startState: startState === "" || startState === "All States" ? null : startState,
        month,
      }
      setItinerary(buildItinerary(destinations, prefs))
      setBuilding(false)
    }, 350)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm" aria-hidden />
        <div className="absolute inset-0 bg-grid-pattern text-foreground/5" aria-hidden />

        <div className="container relative mx-auto px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Wand2 className="h-3.5 w-3.5" />
            Trip Planner
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Tell us your <span className="text-gradient-brand">vibe</span>,
            <br className="hidden sm:block" />
            we&apos;ll spin up the route.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Pick your days, your budget and a mood. We&apos;ll thread together a
            multi-stop itinerary using only India&apos;s lesser-known gems.
          </p>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Form */}
          <form
            onSubmit={onPlan}
            className="space-y-6 rounded-3xl border border-border/60 bg-card/85 p-6 shadow-soft-lg backdrop-blur-md sm:p-7"
          >
            <div>
              <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5 text-primary" />
                How many days?
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value) || 1)}
                  className="h-11 w-24 text-center font-semibold tabular-nums"
                />
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
                <span className="w-12 text-right text-sm font-medium text-muted-foreground">
                  {days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            <div>
              <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                What&apos;s the vibe?
              </Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVibe("")}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    vibe === ""
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  ✨ Anything
                </button>
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setVibe((p) => (p === v.value ? "" : v.value))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      vibe === v.value
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <span aria-hidden className="mr-1">
                      {v.emoji}
                    </span>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <IndianRupee className="h-3.5 w-3.5 text-primary" />
                  Budget per stop
                </Label>
                <Select
                  value={budget === "" ? "any" : budget}
                  onValueChange={(v) => setBudget(v === "any" ? "" : (v as Budget))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any budget</SelectItem>
                    {BUDGET_RANGES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Cloud className="h-3.5 w-3.5 text-primary" />
                  Weather
                </Label>
                <Select
                  value={weather === "" ? "any" : weather}
                  onValueChange={(v) => setWeather(v === "any" ? "" : (v as Weather))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any weather</SelectItem>
                    {WEATHER_CONDITIONS.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Starting from
                </Label>
                <Select value={startState || "any"} onValueChange={(v) => setStartState(v === "any" ? "" : v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="any">Anywhere in India</SelectItem>
                    {INDIAN_STATES.filter((s) => s !== "All States").map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATE_META[s]?.emoji ?? "📍"} {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <CalendarRange className="h-3.5 w-3.5 text-primary" />
                  Travel month
                </Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {monthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full gap-2 bg-gradient-to-r from-primary via-primary/95 to-emerald-600 text-base font-semibold shadow-soft-lg"
              disabled={building}
            >
              <Sparkles className={cn("h-4 w-4", building && "animate-spin")} />
              {building ? "Plotting your route…" : "Plan my trip"}
            </Button>
          </form>

          {/* Itinerary */}
          <section>
            {itinerary ? (
              <ItineraryView itinerary={itinerary} days={days} month={month} />
            ) : (
              <PlaceholderState />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PlaceholderState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">Your itinerary will appear here</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Tell us your days, your vibe, and we&apos;ll thread together a hand-built
        multi-stop route through India&apos;s lesser-known corners.
      </p>
    </div>
  )
}

function ItineraryView({
  itinerary,
  days,
  month,
}: {
  itinerary: Itinerary
  days: number
  month: number
}) {
  if (itinerary.stops.length === 0) {
    return <PlaceholderState />
  }
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-6 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              {itinerary.stops.length} stops · {days} days · {monthName(month)}
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your hand-built route
            </h2>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/95 px-4 py-3 text-right shadow-soft">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimated cost
            </div>
            <div className="text-base font-semibold text-foreground">
              {itinerary.estimatedCost}
            </div>
          </div>
        </div>
        {itinerary.notes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {itinerary.notes.map((n, i) => (
              <li
                key={i}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground"
              >
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[18px] before:top-2 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-primary/20 before:to-transparent">
        {itinerary.stops.map((s, i) => (
          <li
            key={s.destination.id}
            className="relative pl-12 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="absolute left-0 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-xs font-bold text-primary-foreground shadow-soft ring-4 ring-background">
              {i + 1}
            </span>
            <ItineraryCard stop={s} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function ItineraryCard({
  stop,
}: {
  stop: Itinerary["stops"][number]
}) {
  const d = stop.destination
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg">
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
        <div className="relative h-32 sm:h-full">
          <DestinationImage
            wikiTitle={d.wikiTitle}
            name={d.name}
            state={d.state}
            fallback={d.image}
            alt={d.name}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
            <CalendarRange className="h-3 w-3" />
            Day {stop.fromDay}
            {stop.toDay > stop.fromDay && `–${stop.toDay}`}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight">{d.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {d.rating.toFixed(1)}
            </span>
          </div>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span aria-hidden>{STATE_META[d.state]?.emoji ?? "📍"}</span>
            {d.state} · {d.type}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary self-start">
            <Wand2 className="h-3 w-3" />
            {stop.reason}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-muted/40 px-2 py-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Best time
              </div>
              <div className="font-medium">{d.bestTime}</div>
            </div>
            <div className="rounded-md bg-muted/40 px-2 py-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Budget
              </div>
              <div className="font-medium">{d.budget}</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={`/destination/${d.id}`}>
              <Button size="sm" className="gap-1.5">
                Open gem
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
            <a
              href={googleMapsUrl(d)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
            >
              <MapPin className="h-3 w-3" />
              Maps
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
