"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarRange,
  Camera,
  CheckCircle2,
  CircleAlert,
  Compass,
  IndianRupee,
  ImageIcon,
  Loader2,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  BUDGET_RANGES,
  INDIAN_STATES,
  LOCATION_TYPES,
  STATE_META,
  WEATHER_CONDITIONS,
  addDestination,
  type Budget,
  type LocationType,
  type Weather,
} from "@/lib/destinations"
import {
  FirebaseUploadError,
  uploadImageToFirebase,
  validateImage,
} from "@/lib/firebase"

interface FormState {
  name: string
  state: string
  type: LocationType | ""
  weather: Weather[]
  budget: Budget | ""
  bestTime: string
  description: string
  rating: number
  tagsInput: string
  tags: string[]
  /** Final hosted URL on Firebase Storage. */
  image: string
  /** Local object-URL preview while the upload is in flight. */
  localPreview: string
  fileName: string
}

const initialForm: FormState = {
  name: "",
  state: "",
  type: "",
  weather: [],
  budget: "",
  bestTime: "",
  description: "",
  rating: 4.5,
  tagsInput: "",
  tags: [],
  image: "",
  localPreview: "",
  fileName: "",
}

const TYPE_VIBES: Record<LocationType, { emoji: string; tone: string }> = {
  Adventurous: { emoji: "🏔️", tone: "from-emerald-500/20 to-teal-500/20" },
  Calm:        { emoji: "🌿", tone: "from-green-400/20 to-emerald-500/20" },
  Cultural:    { emoji: "🛕", tone: "from-amber-500/20 to-orange-500/20" },
  Spiritual:   { emoji: "🕉️", tone: "from-violet-500/20 to-fuchsia-500/20" },
  Beach:       { emoji: "🏝️", tone: "from-cyan-500/20 to-sky-500/20" },
  Historical:  { emoji: "🏛️", tone: "from-rose-500/20 to-orange-500/20" },
}

const WEATHER_VIBES: Record<Weather, string> = {
  Hot: "🔥",
  Cold: "🥶",
  Warm: "🌞",
  Rainy: "🌧️",
  Mild: "🌤️",
  Snowy: "❄️",
}

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string }
  | { kind: "done" }

export default function AddDestinationPage() {
  const router = useRouter()
  const { displayName } = useSupabaseUser()
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [upload, setUpload] = React.useState<UploadState>({ kind: "idle" })
  const [dragOver, setDragOver] = React.useState(false)

  // Revoke object URLs when the component unmounts or the file changes.
  React.useEffect(() => {
    return () => {
      if (form.localPreview && form.localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(form.localPreview)
      }
    }
  }, [form.localPreview])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const toggleWeather = (w: Weather) => {
    setForm((p) => ({
      ...p,
      weather: p.weather.includes(w)
        ? p.weather.filter((x) => x !== w)
        : [...p.weather, w],
    }))
  }

  // ── Image upload ────────────────────────────────────────────────────
  const startUpload = async (file: File) => {
    setError(null)
    try {
      validateImage(file)
    } catch (err) {
      const msg = err instanceof FirebaseUploadError ? err.message : String(err)
      setUpload({ kind: "error", message: msg })
      return
    }

    // Show optimistic preview right away.
    const local = URL.createObjectURL(file)
    setForm((p) => {
      if (p.localPreview && p.localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(p.localPreview)
      }
      return { ...p, localPreview: local, fileName: file.name, image: "" }
    })
    setUpload({ kind: "uploading", progress: 0 })

    try {
      const url = await uploadImageToFirebase(file, {
        baseName: form.name || file.name,
        onProgress: (p) =>
          setUpload({ kind: "uploading", progress: Math.round(p.fraction * 100) }),
      })
      setForm((p) => ({ ...p, image: url }))
      setUpload({ kind: "done" })
    } catch (err) {
      const msg = err instanceof FirebaseUploadError ? err.message : String(err)
      setUpload({ kind: "error", message: msg })
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void startUpload(file)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void startUpload(file)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!dragOver) setDragOver(true)
  }

  const clearImage = () => {
    setForm((p) => {
      if (p.localPreview && p.localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(p.localPreview)
      }
      return { ...p, image: "", localPreview: "", fileName: "" }
    })
    setUpload({ kind: "idle" })
  }

  // ── Tags ────────────────────────────────────────────────────────────
  const addTag = () => {
    const value = form.tagsInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (!value) return
    if (form.tags.includes(value)) {
      update("tagsInput", "")
      return
    }
    setForm((p) => ({ ...p, tags: [...p.tags, value], tagsInput: "" }))
  }
  const removeTag = (t: string) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))

  // ── Submit ──────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.name.trim()) return "Please name your destination."
    if (!form.state) return "Please pick a state."
    if (!form.type) return "Please choose a category."
    if (form.weather.length === 0) return "Pick at least one weather condition."
    if (!form.budget) return "Choose a budget range."
    if (!form.bestTime.trim()) return "Tell us the best time to visit."
    if (form.description.trim().length < 30)
      return "Description should be at least 30 characters."
    if (upload.kind === "uploading")
      return "Hold on — your photo is still uploading."
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setSubmitting(true)
    try {
      const created = addDestination({
        name: form.name.trim(),
        state: form.state,
        type: form.type as LocationType,
        weather: form.weather,
        budget: form.budget as Budget,
        bestTime: form.bestTime.trim(),
        description: form.description.trim(),
        tags: form.tags,
        rating: Number.isFinite(form.rating) ? Math.min(5, Math.max(0, form.rating)) : 4.5,
        image:
          form.image ||
          "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
        addedBy: displayName ?? "Anonymous explorer",
      })
      router.push(`/destination/${created.id}`)
    } catch {
      setError("Couldn’t save your destination. Please try again.")
      setSubmitting(false)
    }
  }

  const completion = computeCompletion(form)
  const previewImage = form.image || form.localPreview

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,114,182,0.18),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.16),transparent_55%)]"
        />
        <div className="container relative mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Share a hidden gem
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Tell the world about a place worth{" "}
              <span className="text-gradient-brand">the detour.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Snap a photo, jot the basics, and share what makes it special. We&apos;ll
              host the picture on Firebase and turn the rest into a card every traveller
              can find.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Pulse n={1} label="The basics" active={completion >= 25} />
              <Pulse n={2} label="Practical info" active={completion >= 50} />
              <Pulse n={3} label="The story" active={completion >= 75} />
              <Pulse n={4} label="Photo" active={!!form.image} />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6 lg:col-span-8">
            {/* Photo first — it's what makes the listing real */}
            <FormSection
              eyebrow="Step 1"
              title="The cover photo"
              icon={Camera}
              description="Drop a great image — it's the first thing travellers see."
            >
              {previewImage ? (
                <ImagePreview
                  src={previewImage}
                  fileName={form.fileName}
                  upload={upload}
                  onClear={clearImage}
                />
              ) : (
                <DropZone
                  dragOver={dragOver}
                  onDragOver={onDragOver}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onChange={onFileChange}
                />
              )}
              {upload.kind === "error" && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {upload.message}
                </div>
              )}
            </FormSection>

            <FormSection
              eyebrow="Step 2"
              title="The basics"
              icon={Compass}
              description="Name, where it is, and the vibe of the place."
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Destination name" htmlFor="name" required>
                  <Input
                    id="name"
                    placeholder="e.g. Ziro Valley"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="h-11"
                  />
                </Field>
                <Field label="State" htmlFor="state" required>
                  <Select
                    value={form.state || undefined}
                    onValueChange={(v) => update("state", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pick a state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {INDIAN_STATES.filter((s) => s !== "All States").map((s) => (
                        <SelectItem key={s} value={s}>
                          <span aria-hidden className="mr-1.5">
                            {STATE_META[s]?.emoji ?? "📍"}
                          </span>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Vibe"
                  htmlFor="type"
                  required
                  hint="Pick the strongest one."
                  full
                >
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_TYPES.map((t) => {
                      const active = form.type === t
                      const meta = TYPE_VIBES[t]
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => update("type", t)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                            active
                              ? "border-primary/30 bg-gradient-to-r text-foreground shadow-soft " + meta.tone
                              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          )}
                        >
                          <span aria-hidden>{meta.emoji}</span>
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                <Field
                  label="Weather"
                  htmlFor="weather"
                  required
                  hint="Pick all that apply."
                  full
                >
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_CONDITIONS.map((w) => {
                      const active = form.weather.includes(w)
                      return (
                        <button
                          type="button"
                          key={w}
                          onClick={() => toggleWeather(w)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            active
                              ? "border-secondary/40 bg-secondary/10 text-secondary"
                              : "border-border bg-background text-muted-foreground hover:border-secondary/40 hover:text-foreground",
                          )}
                        >
                          <span aria-hidden>{WEATHER_VIBES[w]}</span>
                          {w}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              eyebrow="Step 3"
              title="Practical info"
              icon={IndianRupee}
              description="When to go and how much to budget."
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Budget per person" htmlFor="budget" required>
                  <Select
                    value={form.budget || undefined}
                    onValueChange={(v) => update("budget", v as Budget)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a range" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Best time to visit"
                  htmlFor="bestTime"
                  required
                  hint="A short window like ‘Sep-Nov’ or ‘Oct-Mar’."
                >
                  <div className="relative">
                    <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="bestTime"
                      placeholder="e.g. Oct-Mar"
                      value={form.bestTime}
                      onChange={(e) => update("bestTime", e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </Field>

                <Field
                  label="Your rating"
                  htmlFor="rating"
                  hint="0–5, decimals are fine."
                >
                  <RatingInput
                    value={form.rating}
                    onChange={(v) => update("rating", v)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              eyebrow="Step 4"
              title="The story"
              icon={Sparkles}
              description="What makes this place unforgettable?"
            >
              <Field
                label="Description"
                htmlFor="description"
                required
                hint={`At least 30 characters. ${form.description.trim().length}/30 so far.`}
              >
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="A pristine valley where the morning mist rises from terraced rice fields…"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="resize-none text-sm"
                />
              </Field>

              <Field label="Tags" htmlFor="tags" hint="Press Enter to add a tag.">
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-2">
                  {form.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="gap-1 bg-primary/10 text-primary"
                    >
                      <Tag className="h-3 w-3" />
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                        aria-label={`Remove ${t}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    id="tags"
                    value={form.tagsInput}
                    onChange={(e) => update("tagsInput", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addTag()
                      }
                      if (e.key === "Backspace" && !form.tagsInput && form.tags.length) {
                        removeTag(form.tags[form.tags.length - 1])
                      }
                    }}
                    placeholder={form.tags.length ? "" : "trekking, monastery, sunsets…"}
                    className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </Field>
            </FormSection>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5" />
                Photos hosted on Firebase Storage. Description should hint at why this is a hidden gem.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/explore")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="sm:min-w-44 gap-1.5 bg-gradient-to-r from-primary via-primary/95 to-emerald-600 shadow-soft-lg"
                  disabled={submitting || upload.kind === "uploading"}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Publish gem
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Sidebar — live preview + completion */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Live preview
              </div>
              <Card className="gap-4 overflow-hidden border-border/60 p-0 shadow-soft transition hover:shadow-soft-lg">
                <div className="relative aspect-[4/3] bg-muted">
                  {previewImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewImage}
                      alt="Preview"
                      className={cn(
                        "h-full w-full object-cover transition",
                        upload.kind === "uploading" && "blur-[1px] opacity-90",
                      )}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent"
                  />
                  {form.type && (
                    <span
                      className={cn(
                        "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md border border-white/30",
                        TYPE_VIBES[form.type as LocationType].tone,
                      )}
                    >
                      <span aria-hidden>{TYPE_VIBES[form.type as LocationType].emoji}</span>
                      {form.type}
                    </span>
                  )}
                  {form.rating > 0 && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {form.rating.toFixed(1)}
                    </span>
                  )}
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <h3 className="text-lg font-semibold drop-shadow">
                      {form.name || "Your destination name"}
                    </h3>
                    <p className="text-xs text-white/85">
                      <span aria-hidden className="mr-1">
                        {form.state ? STATE_META[form.state]?.emoji ?? "📍" : "📍"}
                      </span>
                      {form.state || "State"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 px-5 pb-5">
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {form.description || "Your description will appear here as you type…"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarRange className="h-3 w-3 text-primary" />
                      {form.bestTime || "Best time"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {form.budget || "Budget"}
                    </span>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {form.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="gap-3 border-border/60 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Form completion
                  </p>
                  <span className="text-sm font-semibold tabular-nums">{completion}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Fill out every section for the most useful, discoverable listing.
                </p>
                <ul className="space-y-1 text-[11px]">
                  <Tick done={!!form.name.trim()}>Name &amp; state</Tick>
                  <Tick done={!!form.type && form.weather.length > 0}>Vibe &amp; weather</Tick>
                  <Tick done={!!form.budget && !!form.bestTime.trim()}>Budget &amp; best time</Tick>
                  <Tick done={form.description.trim().length >= 30}>30-char description</Tick>
                  <Tick done={!!form.image}>Cover photo uploaded</Tick>
                </ul>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────

function DropZone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onChange,
}: {
  dragOver: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed bg-muted/30 transition-all",
        dragOver
          ? "border-primary/70 bg-primary/10"
          : "border-border hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <label
        htmlFor="image-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-12 text-center"
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition",
            dragOver && "scale-110",
          )}
        >
          <Upload className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold">
            {dragOver ? "Drop it here!" : "Drag & drop an image"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or <span className="font-medium text-primary">click to browse</span> · JPG,
            PNG, WebP, AVIF up to 8MB
          </p>
        </div>
        <Input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  )
}

function ImagePreview({
  src,
  fileName,
  upload,
  onClear,
}: {
  src: string
  fileName: string
  upload: UploadState
  onClear: () => void
}) {
  const uploading = upload.kind === "uploading"
  const done = upload.kind === "done"
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Preview"
          className={cn(
            "aspect-video w-full object-cover transition",
            uploading && "blur-[1px] brightness-90",
          )}
        />
        {/* Progress overlay while uploading */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 text-white backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="w-2/3 max-w-xs">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 transition-all"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs font-medium tabular-nums">
                Uploading to Firebase · {upload.progress}%
              </div>
            </div>
          </div>
        )}
        {done && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-soft">
            <CheckCircle2 className="h-3 w-3" />
            Uploaded
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2 truncate text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{fileName || "Cover photo"}</span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onClear}
          disabled={uploading}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Replace
        </Button>
      </div>
    </div>
  )
}

function RatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const display = hover ?? value
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = display >= i
          const half = !filled && display > i - 0.5
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              onMouseEnter={() => setHover(i)}
              className="text-muted-foreground transition hover:scale-110"
              aria-label={`${i} stars`}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : half
                      ? "fill-amber-400/50 text-amber-400/80"
                      : "text-muted-foreground/40",
                )}
              />
            </button>
          )
        })}
      </div>
      <Input
        type="number"
        step="0.1"
        min={0}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-20 text-center font-semibold tabular-nums"
      />
    </div>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Card className="gap-5 border-border/60 p-6 shadow-soft sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  full,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Tick({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5",
        done ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-full",
          done ? "bg-emerald-500 text-white" : "bg-muted",
        )}
      >
        {done && <CheckCircle2 className="h-2.5 w-2.5" />}
      </span>
      {children}
    </li>
  )
}

function Pulse({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition",
        active
          ? "bg-primary/10 text-primary"
          : "bg-background/70 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
          active ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {n}
      </span>
      {label}
    </span>
  )
}

function computeCompletion(f: FormState): number {
  const checks = [
    !!f.name.trim(),
    !!f.state,
    !!f.type,
    f.weather.length > 0,
    !!f.budget,
    !!f.bestTime.trim(),
    f.description.trim().length >= 30,
    f.tags.length > 0,
    !!f.image,
  ]
  const score = checks.filter(Boolean).length
  return Math.round((score / checks.length) * 100)
}

