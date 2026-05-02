"use client"

/**
 * Real India map rendered with react-simple-maps + a public-domain India
 * states topojson stored at /public/india-states.json.
 *
 * Two render modes:
 *   • "heat"     – Explore page: shade each state by gem count.
 *   • "passport" – Passport page: amber/glow for unlocked, slate for locked.
 */

import * as React from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps"

import { INDIA_TOPO_URL, canonicalState } from "@/lib/india-geo"
import { cn } from "@/lib/utils"

export type IndiaMapMode = "heat" | "passport"

export interface IndiaMapProps {
  mode: IndiaMapMode
  /**
   * heat-mode: gem count by canonical state name.
   * passport-mode: ignored (use `unlockedStates` instead).
   */
  countsByState?: Record<string, number>
  /** passport-mode: set of canonical state names that are unlocked. */
  unlockedStates?: Set<string>
  /** Currently focused state (canonical). */
  selectedState?: string | null
  /** Names to "highlight" (e.g. fuzzy-matched in search). */
  highlightStates?: string[]
  onSelectState?: (canonical: string | null) => void
  onHoverState?: (canonical: string | null) => void
  className?: string
  /** Maximum count for the heat scale. Auto-computed when omitted. */
  maxCount?: number
}

// Rough projection settings centring on India.
const PROJECTION_CONFIG = {
  scale: 980,
  center: [82.5, 23] as [number, number],
}

/**
 * Lerp three RGB stops to produce a heat colour.
 */
function heatColor(t: number, alpha = 1): string {
  const stops = [
    [0,    [16, 185, 129]],   // emerald-500
    [0.55, [251, 191, 36]],   // amber-400
    [1,    [244, 63, 94]],    // rose-500
  ] as const
  if (t <= 0) return `rgba(${stops[0][1].join(",")},${alpha})`
  if (t >= 1) return `rgba(${stops[2][1].join(",")},${alpha})`
  for (let i = 1; i < stops.length; i++) {
    const [stop, color] = stops[i]
    const [prev, prevColor] = stops[i - 1]
    if (t <= stop) {
      const f = (t - prev) / (stop - prev)
      const r = Math.round(prevColor[0] + (color[0] - prevColor[0]) * f)
      const g = Math.round(prevColor[1] + (color[1] - prevColor[1]) * f)
      const b = Math.round(prevColor[2] + (color[2] - prevColor[2]) * f)
      return `rgba(${r},${g},${b},${alpha})`
    }
  }
  return `rgba(${stops[0][1].join(",")},${alpha})`
}

interface GeoFeature {
  rsmKey: string
  properties: { name?: string }
  geometry: unknown
}

export function IndiaMap({
  mode,
  countsByState = {},
  unlockedStates,
  selectedState,
  highlightStates,
  onSelectState,
  onHoverState,
  className,
  maxCount,
}: IndiaMapProps) {
  const [hover, setHover] = React.useState<string | null>(null)
  const computedMax = React.useMemo(() => {
    if (typeof maxCount === "number" && maxCount > 0) return maxCount
    let m = 0
    for (const v of Object.values(countsByState)) if (v > m) m = v
    return m
  }, [countsByState, maxCount])

  const highlightSet = React.useMemo(
    () => new Set((highlightStates ?? []).map(canonicalState)),
    [highlightStates],
  )

  return (
    <div className={cn("relative", className)}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={620}
        height={680}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup zoom={1} minZoom={0.9} maxZoom={3} center={[82.5, 23]}>
          <Geographies geography={INDIA_TOPO_URL}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo) => {
                const raw = geo.properties.name ?? ""
                const canonical = canonicalState(raw)
                const isSelected = selectedState
                  ? canonicalState(selectedState) === canonical
                  : false
                const isHover = hover === canonical
                const isHighlight = highlightSet.has(canonical)

                let fill = "rgba(148,163,184,0.18)"
                let stroke = "rgba(148,163,184,0.55)"

                if (mode === "heat") {
                  const count = countsByState[canonical] ?? 0
                  if (count > 0 && computedMax > 0) {
                    const t = count / computedMax
                    fill = heatColor(t, isSelected || isHover ? 0.95 : 0.78)
                    stroke = heatColor(t, 1)
                  } else {
                    fill = "rgba(148,163,184,0.18)"
                    stroke = "rgba(148,163,184,0.5)"
                  }
                } else {
                  // passport mode
                  const earned = unlockedStates?.has(canonical) ?? false
                  if (earned) {
                    fill = "rgba(251,191,36,0.85)"
                    stroke = "rgba(245,158,11,1)"
                  } else {
                    fill = "rgba(71,85,105,0.55)"
                    stroke = "rgba(100,116,139,0.7)"
                  }
                }

                if (isSelected) {
                  stroke = "#fde68a"
                }
                if (isHighlight && !isSelected) {
                  stroke = "#a78bfa"
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setHover(canonical)
                      onHoverState?.(canonical)
                    }}
                    onMouseLeave={() => {
                      setHover(null)
                      onHoverState?.(null)
                    }}
                    onClick={() => {
                      onSelectState?.(isSelected ? null : canonical)
                    }}
                    style={{
                      default: {
                        fill,
                        stroke,
                        strokeWidth: isSelected ? 1.6 : isHighlight ? 1.4 : 0.6,
                        outline: "none",
                        transition: "fill 200ms, stroke 200ms",
                        cursor: "pointer",
                        filter: isSelected || isHover
                          ? "drop-shadow(0 0 6px rgba(251,191,36,0.55))"
                          : undefined,
                      },
                      hover: {
                        fill,
                        stroke: "#fde68a",
                        strokeWidth: 1.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill,
                        stroke: "#fde68a",
                        strokeWidth: 1.8,
                        outline: "none",
                      },
                    }}
                    aria-label={raw}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover label — uses canonicalState so spelling normalises */}
      {hover && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-amber-200 shadow backdrop-blur-md">
          {hover}
          {mode === "heat" && (
            <span className="ml-1 font-normal text-slate-300">
              · {countsByState[hover] ?? 0} gem
              {(countsByState[hover] ?? 0) === 1 ? "" : "s"}
            </span>
          )}
          {mode === "passport" && (
            <span className="ml-1 font-normal text-slate-300">
              · {unlockedStates?.has(hover) ? "Unlocked" : "Locked"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
