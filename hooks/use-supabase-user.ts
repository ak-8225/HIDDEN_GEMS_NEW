"use client"

import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface UseSupabaseUser {
  user: User | null
  status: AuthStatus
  displayName: string | null
  email: string | null
}

export function useSupabaseUser(): UseSupabaseUser {
  const supabase = React.useMemo(() => createClient(), [])
  const [user, setUser] = React.useState<User | null>(null)
  const [status, setStatus] = React.useState<AuthStatus>("loading")

  React.useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user ?? null)
      setStatus(data.user ? "authenticated" : "unauthenticated")
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setStatus(session?.user ? "authenticated" : "unauthenticated")
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    null

  return {
    user,
    status,
    displayName,
    email: user?.email ?? null,
  }
}
