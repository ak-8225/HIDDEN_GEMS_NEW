"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        setSuccess("Login successful! Redirecting...")
        setTimeout(() => router.push("/explore"), 1500)
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validation
    if (!email || !password || !name) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        setLoading(false)
        return
      }

      setSuccess("Account created successfully! Logging in...")
      
      // Auto-login after signup
      setTimeout(async () => {
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (loginResult?.ok) {
          router.push("/explore")
        } else {
          setError("Account created, but login failed. Please login manually.")
          setIsLogin(true)
          setPassword("")
        }
      }, 1500)
    } catch (err) {
      setError("Signup failed. Please try again.")
      setLoading(false)
    }
  }

  const handleSubmit = isLogin ? handleLogin : handleSignUp

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center mt-2">
              {isLogin
                ? "Sign in to explore India's hidden gems"
                : "Join us to discover amazing destinations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#1A6B3C] hover:bg-[#155233] text-white font-semibold py-2 h-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle Button */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setSuccess("")
                  setEmail("")
                  setPassword("")
                  setConfirmPassword("")
                  setName("")
                }}
                disabled={loading}
                className="text-primary hover:underline font-semibold disabled:opacity-50"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {/* Demo Credentials */}
            {isLogin && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  💡 Demo Credentials (if needed):
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Email: demo@example.com
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Password: demo123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
