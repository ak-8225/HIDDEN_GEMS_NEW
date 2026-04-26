"use client"

import Link from "next/link"
import { Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Mountain className="h-6 w-6 text-primary" />
          Hidden Gems
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/explore" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Explore
          </Link>
          <Link
            href="/add-destination"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Add Destination
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
