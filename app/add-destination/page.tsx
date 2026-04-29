"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Compass,
  IndianRupee,
  ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Tag,
  Thermometer,
  Upload,
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
  WEATHER_CONDITIONS,
  addDestination,
  type Budget,
  type LocationType,
  type Weather,
} from "@/lib/destinations"

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
  image: string
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
  fileName: "",
}

export default function AddDestinationPage() {
  const router = useRouter()
  const { displayName } = useSupabaseUser()
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setForm((p) => ({ ...p, image: result, fileName: file.name }))
    }
    reader.readAsDataURL(file)
  }

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

  const validate = (): string | null => {
    if (!form.name.trim()) return "Please name your destination."
    if (!form.state) return "Please pick a state."
    if (!form.type) return "Please choose a category."
    if (form.weather.length === 0) return "Pick at least one weather condition."
    if (!form.budget) return "Choose a budget range."
    if (!form.bestTime.trim()) return "Tell us the best time to visit."
    if (form.description.trim().length < 30)
      return "Description should be at least 30 characters."
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-warm" aria-hidden />
        <div className="container relative mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Share a hidden gem
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Help fellow travelers find their{" "}
              <span className="text-gradient-brand">next quiet adventure</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tell us about a place worth the detour — what makes it special, when to go, and how
              much it should cost.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6 lg:col-span-8">
            <FormSection
              eyebrow="Step 1"
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
                    <SelectContent>
                      {INDIAN_STATES.filter((s) => s !== "All States").map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Category" htmlFor="type" required hint="Pick the strongest vibe.">
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_TYPES.map((t) => {
                      const active = form.type === t
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => update("type", t)}
                          className={cn(
                            "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            active
                              ? "border-primary bg-primary text-primary-foreground shadow-soft"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
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
                              ? "border-secondary bg-secondary/10 text-secondary"
                              : "border-border bg-background text-muted-foreground hover:border-secondary/40 hover:text-foreground",
                          )}
                        >
                          <Thermometer className="h-3 w-3" />
                          {w}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              eyebrow="Step 2"
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
                  hint="A short window like ‘Sep–Nov’."
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
                  hint="Out of 5, decimals are fine."
                >
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-amber-400 text-amber-400" />
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      value={form.rating}
                      onChange={(e) => update("rating", Number(e.target.value))}
                      className="h-11 pl-10"
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              eyebrow="Step 3"
              title="The story"
              icon={Sparkles}
              description="What makes this place unforgettable?"
            >
              <Field
                label="Description"
                htmlFor="description"
                required
                hint="At least 30 characters. Be specific — what do you see, hear, taste?"
              >
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="A pristine valley where..."
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

            <FormSection
              eyebrow="Step 4"
              title="Visual"
              icon={ImageIcon}
              description="A great photo makes a difference."
            >
              {form.image ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Preview"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted-foreground">{form.fileName}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((p) => ({ ...p, image: "", fileName: "" }))
                      }
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium">
                    Click to upload an image
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG up to ~5MB. We&apos;ll show a placeholder if you skip this.
                  </p>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </label>
              )}
            </FormSection>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/explore")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="sm:min-w-44" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Publish destination
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Sidebar — live preview + completion */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <Card className="gap-4 overflow-hidden border-border/60 p-0 shadow-soft">
                <div className="relative aspect-[4/3] bg-muted">
                  {form.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
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
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <h3 className="text-lg font-semibold drop-shadow">
                      {form.name || "Your destination name"}
                    </h3>
                    <p className="text-xs text-white/85">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {form.state || "State"}
                    </p>
                  </div>
                  {form.type && (
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                      {form.type}
                    </span>
                  )}
                </div>
                <div className="space-y-2 px-5 pb-5">
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {form.description || "Your description will appear here as you type…"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      <CalendarRange className="mr-1 inline h-3 w-3 text-primary" />
                      {form.bestTime || "Best time"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {form.budget || "Budget"}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="gap-3 border-border/60 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Form completion
                  </p>
                  <span className="text-sm font-semibold">{completion}%</span>
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
              </Card>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
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
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
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
