"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FALLBACK_IMAGE } from "@/lib/destinations"
import { fetchResolvedDestinationImage } from "@/lib/wiki-image"

export interface DestinationImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  wikiTitle?: string
  /** Destination display name — drives Commons search when Wikipedia misses. */
  name: string
  /** Indian state — scopes Commons search for accuracy. */
  state: string
  /** Dataset URL used only when resolver finds nothing (often Wikimedia already). */
  fallback?: string
  alt: string
}

/**
 * Accurate destination photo via server-side Wikipedia + Wikimedia Commons.
 * Shows a shimmer skeleton instead of repeating generic placeholders while resolving.
 */
export function DestinationImage({
  wikiTitle,
  name,
  state,
  fallback,
  alt,
  className,
  ...rest
}: DestinationImageProps) {
  const [src, setSrc] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetchResolvedDestinationImage({ wikiTitle, name, state }).then((url) => {
      if (cancelled) return
      const chosen = url ?? fallback ?? FALLBACK_IMAGE
      const probe = new Image()
      probe.onload = () => {
        if (!cancelled) setSrc(chosen)
      }
      probe.onerror = () => {
        if (!cancelled) setSrc(fallback ?? FALLBACK_IMAGE)
      }
      probe.src = chosen
    })
    return () => {
      cancelled = true
    }
  }, [wikiTitle, name, state, fallback])

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      {!src && (
        <div
          aria-hidden
          className="absolute inset-0 animate-shimmer bg-gradient-to-br from-muted via-muted/70 to-muted"
        />
      )}
      {src && (
        <img
          {...rest}
          alt={alt}
          src={src}
          loading={rest.loading ?? "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 opacity-100"
          onError={(e) => {
            const img = e.currentTarget
            if (img.dataset.fallback === "1") return
            img.dataset.fallback = "1"
            img.src = FALLBACK_IMAGE
            rest.onError?.(e)
          }}
        />
      )}
    </div>
  )
}
