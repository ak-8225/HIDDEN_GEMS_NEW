"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  Mail,
  MountainSnow,
  Sparkles,
  User as UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const HIGHLIGHTS = [
  { icon: Compass, label: "36 hand-picked Indian gems" },
  { icon: Sparkles, label: "Filter by mood, weather & budget" },
  { icon: Heart, label: "Built for sustainable, slow travel" },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [tab, setTab] = React.useState<"signin" | "signup">("signin")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [name, setName] = React.useState("")

  const resetMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess("Welcome back. Redirecting…")
    router.push("/explore")
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!email || !password || !name) {
      setError("Please fill in all fields.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/explore`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setSuccess("Account created. Check your email to confirm before signing in.")
      setTab("signin")
      setPassword("")
      setConfirmPassword("")
      setLoading(false)
      return
    }

    setSuccess("Account created. Redirecting…")
    router.push("/explore")
    router.refresh()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh-warm">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Marketing pane */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
              <MountainSnow className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight">Hidden Gems</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Discover India
              </span>
            </span>
          </Link>

          <div className="max-w-md animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Beyond the postcards
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight">
              Find India&apos;s{" "}
              <span className="text-gradient-brand">untold corners</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Curated valleys, ancient ghats, sleepy beaches and forgotten forts —
              hand-picked for travelers who want the road less filtered.
            </p>

            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <Heart className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  &ldquo;I found Ziro Valley here and spent the most magical week of my life.&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">— A fellow explorer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form pane */}
        <div className="flex flex-col p-6 sm:p-10 lg:p-12">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            {/* Mobile brand */}
            <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2.5 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
                <MountainSnow className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Hidden Gems</span>
            </Link>

            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "signin"
                  ? "Sign in to continue exploring India's hidden corners."
                  : "Join a community discovering destinations off the beaten path."}
              </p>
            </div>

            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as "signin" | "signup")
                resetMessages()
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
                <TabsTrigger value="signin" className="rounded-full">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full">
                  Create account
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-5 border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mt-5 border-primary/30 bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <FieldEmail value={email} onChange={setEmail} disabled={loading} />
                  <FieldPassword
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((s) => !s)}
                    disabled={loading}
                  />
                  <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <FieldName value={name} onChange={setName} disabled={loading} />
                  <FieldEmail value={email} onChange={setEmail} disabled={loading} />
                  <FieldPassword
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((s) => !s)}
                    disabled={loading}
                    helper="Minimum 6 characters"
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By creating an account you agree to travel responsibly and respect local
                    communities.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hidden Gems · Made for explorers
          </p>
        </div>
      </div>
    </div>
  )
}

function FieldEmail({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="email" className="text-sm font-medium">
        Email
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          autoComplete="email"
          className="h-11 pl-10"
        />
      </div>
    </div>
  )
}

function FieldPassword({
  value,
  onChange,
  show,
  onToggle,
  disabled,
  helper,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  disabled?: boolean
  helper?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="password" className="text-sm font-medium">
        Password
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="password"
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          autoComplete="current-password"
          className="h-11 pl-10 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function FieldName({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="name" className="text-sm font-medium">
        Full name
      </Label>
      <div className="relative">
        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="name"
          type="text"
          placeholder="Aisha Khan"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          autoComplete="name"
          className="h-11 pl-10"
        />
      </div>
    </div>
  )
}
