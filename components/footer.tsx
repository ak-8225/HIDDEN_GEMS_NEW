"use client"

import * as React from "react"
import Link from "next/link"
import {
  Check,
  Compass,
  Github,
  Heart,
  Loader2,
  Mail,
  MountainSnow,
  Plus,
} from "lucide-react"

const FOOTER_LINKS: Array<{
  title: string
  links: Array<{ label: string; href: string; icon?: React.ComponentType<{ className?: string }> }>
}> = [
  {
    title: "Discover",
    links: [
      { label: "Explore Destinations", href: "/explore", icon: Compass },
      { label: "Share a Gem", href: "/add-destination", icon: Plus },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "About the Project", href: "#" },
      { label: "Travel Guidelines", href: "#" },
      { label: "Sustainable Tourism", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", href: "mailto:hello@example.com", icon: Mail },
      { label: "GitHub", href: "https://github.com", icon: Github },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
                <MountainSnow className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Hidden Gems</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community-driven travel discovery platform for India&apos;s lesser-known
              destinations. Authentic experiences, sustainable journeys, off the beaten path.
            </p>
            <div className="mt-6 flex items-center gap-1.5">
              {(["Adventurous", "Calm", "Cultural", "Spiritual", "Beach", "Historical"] as const).map(
                (t) => (
                  <span
                    key={t}
                    className="hidden rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline-flex"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary"
                      >
                        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter / mini-CTA */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Stay inspired
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Travel ideas worth waking up for, in your inbox once a month.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Hidden Gems · Academic major project, made with care.</p>
          <p className="inline-flex items-center gap-1.5">
            Crafted with <Heart className="h-3.5 w-3.5 text-secondary" aria-hidden /> for explorers
            of India.
          </p>
        </div>
      </div>
    </footer>
  )
}

function NewsletterForm() {
  const [email, setEmail] = React.useState("")
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setState("loading")
    setTimeout(() => setState("done"), 600)
  }

  if (state === "done") {
    return (
      <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
        <Check className="h-4 w-4" />
        You&apos;re on the list. Thank you!
      </div>
    )
  }

  return (
    <form className="mt-4 flex items-center gap-2" onSubmit={onSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
      >
        {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Join
      </button>
    </form>
  )
}
