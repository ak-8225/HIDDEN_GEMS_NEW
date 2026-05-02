"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Cloud,
  Compass,
  ExternalLink,
  Heart,
  Home,
  IndianRupee,
  MapPin,
  Navigation,
  Share2,
  Sparkles,
  Star,
  Tag,
  Thermometer,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DestinationImage } from "@/components/destination-image"
import {
  STATE_META,
  addSaveTo,
  getAllDestinations,
  getDestinationById,
  getThemesForId,
  googleMapsUrl,
  readLikes,
  readSaves,
  removeSaveFrom,
  toggleLike,
  type Destination,
  type Saves,
} from "@/lib/destinations"

function highlightsFor(d: Destination): string[] {
  const items: string[] = []
  if (d.tags?.length) {
    for (const t of d.tags.slice(0, 4)) {
      const pretty = t.replace(/-/g, " ")
      items.push(`Experience the ${pretty} that defines ${d.name}.`)
    }
  }
  items.push(
    `Plan your visit between ${d.bestTime} for the most rewarding weather and atmosphere.`,
  )
  items.push(
    `Budget around ${d.budget} per person — covering stay, local food, and transit.`,
  )
  return items.slice(0, 5)
}

function leadSentence(description: string): { short: string; rest: string | null } {
  const t = description.trim()
  const match = t.match(/^(.{20,280}?[.!?])(\s+|$)/)
  if (match?.[1]) {
    const short = match[1].trim()
    const rest = t.slice(short.length).trim()
    return { short, rest: rest.length > 0 ? rest : null }
  }
  if (t.length <= 220) return { short: t, rest: null }
  return { short: t.slice(0, 217).trim() + "…", rest: t }
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 backdrop-blur-md transition hover:bg-white/10">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 text-white ring-1 ring-white/15">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-white" title={value}>
          {value}
        </div>
      </div>
    </div>
  )
}

function StarMeter({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const full = rating >= i + 1
        const partial = !full && rating > i && rating < i + 1
        return (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              full
                ? "fill-amber-400 text-amber-400"
                : partial
                  ? "fill-amber-400/45 text-amber-400/80"
                  : "fill-muted/50 text-muted-foreground/40",
            )}
          />
        )
      })}
    </div>
  )
}

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params?.id)

  const [destination, setDestination] = React.useState<Destination | null | undefined>(undefined)
  const [related, setRelated] = React.useState<Destination[]>([])
  const [saves, setSaves] = React.useState<Saves>({})
  const [likes, setLikes] = React.useState<number[]>([])
  // Parallax scroll position for the hero cover
  const [scrollY, setScrollY] = React.useState(0)
  React.useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScrollY(Math.min(window.scrollY, 600)))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  React.useEffect(() => {
    if (!Number.isFinite(id)) {
      setDestination(null)
      return
    }
    const found = getDestinationById(id) ?? null
    setDestination(found)
    if (found) {
      const all = getAllDestinations()
      setRelated(
        all.filter((d) => d.id !== found.id && d.type === found.type).slice(0, 4),
      )
    }
    setSaves(readSaves())
    setLikes(readLikes())
  }, [id])

  const handleShare = async () => {
    if (typeof window === "undefined" || !destination) return
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: destination.name, text: destination.description.slice(0, 140), url })
      } catch {
        /* cancelled */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* noop */
    }
  }

  if (destination === undefined) {
    return <DetailSkeleton />
  }

  if (destination === null) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24">
          <div className="pointer-events-none absolute inset-0 bg-mesh-warm opacity-60" aria-hidden />
          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-card shadow-soft">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">We couldn&apos;t find this gem</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              The link may be outdated or the destination was removed. Head back to Explore and keep discovering.
            </p>
            <Button onClick={() => router.push("/explore")} className="mt-8 gap-2 shadow-soft">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const d = destination
  const stateEmoji = STATE_META[d.state]?.emoji ?? "📍"
  const { short: leadShort, rest: leadRest } = leadSentence(d.description)
  const mapsUrl = googleMapsUrl(d)
  const liked = likes.includes(d.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* ─── Cinematic Hero ─── */}
      <section className="relative isolate max-h-[min(92vh,1000px)] min-h-[min(72vh,820px)] w-full overflow-hidden">
        {/* Ken-Burns + parallax cover */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(0, ${scrollY * 0.35}px, 0)` }}
        >
          <DestinationImage
            wikiTitle={d.wikiTitle}
            name={d.name}
            state={d.state}
            fallback={d.image}
            alt={d.name}
            loading="eager"
            className="absolute inset-0 h-[115%] w-full animate-ken-burns"
          />
        </div>

        {/* Cinematic gradient stack */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(0,0,0,0.85),transparent)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(244,114,182,0.18),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(251,191,36,0.18),transparent_55%)] mix-blend-screen"
        />
        <div
          aria-hidden
          className="absolute inset-0 animate-drift opacity-40 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Soft vignette ring at bottom for the headline */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/85 via-black/30 to-transparent"
        />

        {/* Top bar: breadcrumb + primary actions */}
        <div className="absolute left-0 right-0 top-0 z-10 px-4 pt-28 sm:px-6 lg:px-8">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-white/75 sm:text-xs"
            >
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white">
                <Home className="h-3 w-3 opacity-90" />
                Home
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
              <Link href="/explore" className="transition hover:text-white">
                Explore
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
              <span className="inline-flex items-center gap-1 text-white/95">
                <span aria-hidden>{stateEmoji}</span>
                <span className="max-w-[12rem] truncate sm:max-w-none">{d.state}</span>
              </span>
            </nav>
            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
              >
                <Navigation className="h-3.5 w-3.5" />
                Maps
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => setLikes(toggleLike(d.id))}
                aria-label={liked ? "Remove like" : "Like"}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition",
                  liked ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-white/15 text-white hover:bg-white/25",
                )}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              </button>
              <DetailSavePopover
                destination={d}
                saves={saves}
                setSaves={setSaves}
              />
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="container relative z-[1] mx-auto flex h-full min-h-[min(58vh,720px)] flex-col justify-end px-4 pb-12 pt-36 sm:px-6 sm:pb-14 lg:px-8">
          <Link
            href="/explore"
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:border-white/35 hover:bg-black/35"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Explore
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/90 to-emerald-600/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              {d.type}
            </span>
            <Badge className="border-white/25 bg-white/15 text-white backdrop-blur-md">
              <span aria-hidden className="mr-1">{stateEmoji}</span>
              {d.state}
            </Badge>
            <Badge className="border-amber-300/40 bg-amber-400 text-amber-950 shadow-md">
              <Star className="h-3 w-3 fill-amber-950" />
              {d.rating.toFixed(1)}
            </Badge>
          </div>

          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
            {d.name}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/92 sm:text-lg">
            {leadShort}
          </p>
          {leadRest && (
            <a
              href="#about-place"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline-offset-4 hover:underline"
            >
              Read full story
              <ChevronDown className="h-4 w-4" />
            </a>
          )}

          {/* Glass stat bar */}
          <div className="mt-8 inline-grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur-xl sm:grid-cols-4">
            <HeroStat icon={IndianRupee} label="Budget" value={d.budget.replace(/^₹/, "₹")} />
            <HeroStat icon={CalendarRange} label="Best time" value={d.bestTime} />
            <HeroStat icon={Cloud} label="Weather" value={d.weather.slice(0, 2).join(" · ")} />
            <HeroStat icon={MapPin} label="State" value={d.state} />
          </div>

          <div
            aria-hidden
            className="pointer-events-none mt-8 flex justify-center pb-2 opacity-70"
          >
            <div className="h-8 w-5 rounded-full border-2 border-white/40 p-1">
              <div className="mx-auto h-1.5 w-1 animate-bounce rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Body ─── */}
      <div className="relative border-t border-border/60 bg-background">
        <div className="pointer-events-none absolute inset-0 bg-mesh-warm opacity-40 dark:opacity-25" aria-hidden />
        <main className="container relative mx-auto flex-1 px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-12 lg:col-span-8">
              <article
                id="about-place"
                className="animate-fade-in-up scroll-mt-28 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-soft backdrop-blur-sm sm:p-8 lg:p-10"
                style={{ animationDelay: "0ms" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">About this place</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Why travellers love it
                </h2>
                <div className="mt-6 border-l-[3px] border-primary/60 pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  <p className="text-pretty text-foreground/95">{d.description}</p>
                </div>
              </article>

              <Section
                eyebrow="Highlights"
                title={`What makes ${d.name} special`}
                icon={Sparkles}
                delay={60}
              >
                <ul className="space-y-4">
                  {highlightsFor(d).map((h, i) => (
                    <li
                      key={i}
                      className="group flex gap-4 rounded-xl border border-transparent bg-muted/30 p-4 transition hover:border-primary/15 hover:bg-muted/50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
                        <Star className="h-4 w-4" />
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">{h}</p>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section eyebrow="Vibe" title="Tags & themes" icon={Tag} delay={120}>
                <div className="flex flex-wrap gap-2">
                  {d.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-medium shadow-sm"
                    >
                      <Tag className="mr-1.5 h-3 w-3 text-primary" />
                      {t.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </Section>

              <Section eyebrow="Logistics" title="Plan your trip" icon={Compass} delay={180}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoTile icon={CalendarRange} label="Best time to visit" value={d.bestTime} accent="from-emerald-500/10 to-teal-500/5" />
                  <InfoTile icon={IndianRupee} label="Budget per person" value={d.budget} accent="from-amber-500/10 to-orange-500/5" />
                  <InfoTile icon={MapPin} label="Region" value={d.state} accent="from-sky-500/10 to-indigo-500/5" />
                  <InfoTile
                    icon={Thermometer}
                    label="Typical weather"
                    value={d.weather.join(" · ")}
                    accent="from-violet-500/10 to-fuchsia-500/5"
                  />
                </div>
              </Section>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                <Card className="overflow-hidden border-border/60 shadow-soft-lg ring-1 ring-black/5 dark:ring-white/10">
                  <div className="bg-gradient-to-br from-primary/12 via-card to-secondary/10 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Quick snapshot
                        </p>
                        <h3 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight">{d.name}</h3>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span aria-hidden>{stateEmoji}</span>
                          {d.state}, India
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold tabular-nums text-foreground">{d.rating.toFixed(1)}</p>
                        <StarMeter rating={d.rating} />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 p-5">
                    <Stat icon={IndianRupee} label="Budget" value={d.budget} />
                    <Stat icon={MapPin} label="State" value={d.state} />
                    <Stat icon={CalendarRange} label="Best" value={d.bestTime.split(",")[0] ?? d.bestTime} />
                    <Stat icon={Cloud} label="Weather" value={d.weather[0]} />
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2 p-5">
                    <Button asChild size="lg" className="w-full gap-2 shadow-md">
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-4 w-4" />
                        Open in Google Maps
                        <ExternalLink className="h-3.5 w-3.5 opacity-90" />
                      </a>
                    </Button>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={liked ? "default" : "outline"}
                        className="min-w-0 flex-1 gap-1 px-2 text-xs sm:text-sm"
                        onClick={() => setLikes(toggleLike(d.id))}
                      >
                        <Heart className={cn("h-4 w-4 shrink-0", liked && "fill-current")} />
                        Like
                      </Button>
                      <div className="min-w-0 flex-1">
                        <DetailSavePopover
                          destination={d}
                          saves={saves}
                          setSaves={setSaves}
                          triggerVariant="outline"
                        />
                      </div>
                      <Button variant="outline" className="min-w-0 flex-1 gap-1 px-2 text-xs sm:text-sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 shrink-0" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="border-primary/25 bg-gradient-to-br from-primary/8 to-transparent p-5 shadow-soft">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    Travel responsibly
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Remote and fragile places need light footsteps. Carry waste out, hire local guides, and honour local
                    customs.
                  </p>
                </Card>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="relative mt-20 border-t border-border/60 pt-16">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">You may also like</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    More <span className="text-gradient-brand"> {d.type.toLowerCase()}</span> gems
                  </h2>
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                    Curated picks in the same spirit — keep your trip full of surprises.
                  </p>
                </div>
                <Button variant="outline" asChild className="w-full shrink-0 gap-2 sm:w-auto">
                  <Link href="/explore">
                    Browse all
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((r, i) => (
                  <RelatedCard key={r.id} d={r} index={i} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

function DetailSavePopover({
  destination,
  saves,
  setSaves,
  triggerVariant = "floating",
}: {
  destination: Destination
  saves: Saves
  setSaves: React.Dispatch<React.SetStateAction<Saves>>
  triggerVariant?: "floating" | "outline"
}) {
  const [newTheme, setNewTheme] = React.useState("")
  const themesForId = getThemesForId(saves, destination.id)
  const isSaved = themesForId.length > 0
  const themeOptions = Array.from(
    new Set([...Object.keys(saves), "Wishlist", "Travel 2027", "Summer", "Winter"]),
  )

  const onSave = (theme: string) => setSaves(addSaveTo(theme, destination.id))
  const onUnsave = (theme: string) => setSaves(removeSaveFrom(theme, destination.id))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={isSaved ? "Edit saved themes" : "Save to collection"}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition",
            triggerVariant === "floating"
              ? cn(
                  "h-9 px-3 backdrop-blur-md",
                  isSaved
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-white/15 text-white hover:bg-white/25",
                )
              : cn(
                  "h-9 w-full rounded-md border border-input bg-background px-3 hover:bg-accent hover:text-accent-foreground",
                  isSaved && "border-primary/40 bg-primary/10 text-primary",
                ),
          )}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {triggerVariant === "outline" ? (isSaved ? "Saved" : "Save") : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Save to a theme</p>
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
          {themeOptions.map((t) => {
            const checked = themesForId.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => (checked ? onUnsave(t) : onSave(t))}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition",
                  checked ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
              >
                <span className="inline-flex items-center gap-2 truncate">
                  {checked ? <BookmarkCheck className="h-4 w-4 shrink-0" /> : <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  {t}
                </span>
                {checked && <span className="text-[10px] font-medium">Saved</span>}
              </button>
            )
          })}
        </div>
        <Separator className="my-3" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">New theme</p>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const t = newTheme.trim()
            if (!t) return
            onSave(t)
            setNewTheme("")
          }}
        >
          <Input value={newTheme} onChange={(e) => setNewTheme(e.target.value)} placeholder="e.g. Monsoon 2027" className="h-9" />
          <Button type="submit" size="sm" className="h-9 shrink-0">
            Add
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function Section({
  eyebrow,
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  eyebrow: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  delay?: number
}) {
  return (
    <Card
      className="animate-fade-in-up gap-6 border-border/70 bg-card/90 p-6 shadow-soft backdrop-blur-sm sm:p-8"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm ring-1 ring-primary/10">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.65rem]">{title}</h2>
        </div>
      </div>
      {children}
    </Card>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-gradient-to-br p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md",
        accent,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-base font-semibold leading-snug text-foreground">{value}</p>
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
  value: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground" title={value}>
        {value}
      </p>
    </div>
  )
}

function RelatedCard({ d, index }: { d: Destination; index: number }) {
  const emoji = STATE_META[d.state]?.emoji ?? "📍"
  return (
    <Link
      href={`/destination/${d.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="relative h-full gap-0 overflow-hidden border-border/60 bg-card p-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <DestinationImage
            wikiTitle={d.wikiTitle}
            name={d.name}
            state={d.state}
            fallback={d.image}
            alt={d.name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {d.rating.toFixed(1)}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md">
              {emoji} {d.state}
            </span>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-white drop-shadow">{d.name}</h3>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition group-hover:text-white">
              View destination
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="h-[min(58vh,720px)] w-full animate-shimmer bg-muted" />
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="h-48 animate-shimmer rounded-2xl" />
            <div className="h-72 animate-shimmer rounded-2xl" />
            <div className="h-40 animate-shimmer rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 animate-shimmer rounded-2xl" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
