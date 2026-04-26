"use client"

import Link from "next/link"
import { Mountain, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Mountain className="h-6 w-6 text-primary" />
          Hidden Gems
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Explore
          </Link>
          <Link
            href="/add-destination"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Add Destination
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{session.user.name}</span>
              </span>
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
