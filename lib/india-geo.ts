/**
 * Helpers for the real India map (rendered via react-simple-maps).
 *
 * The topojson lives at /india-states.json (sourced from
 * github.com/Anujarya300/bubble_maps). It uses a few state-name spellings
 * that differ from ours, so we normalise them here. Ladakh split from Jammu
 * & Kashmir in 2019 — the topojson predates that, so we map both to a
 * single "Jammu & Kashmir / Ladakh" tile when matching against gems.
 */

export const INDIA_TOPO_URL = "/india-states.json"

/**
 * Map any state-name spelling we encounter (in either the topojson or the
 * gem catalogue) to a single canonical key used inside the map component.
 */
export function canonicalState(name: string | null | undefined): string {
  if (!name) return ""
  const n = name.trim()
  switch (n) {
    case "Arunanchal Pradesh":
    case "Arunachal Pradesh":
      return "Arunachal Pradesh"
    case "Andaman & Nicobar Island":
    case "Andaman & Nicobar":
    case "Andaman and Nicobar Islands":
      return "Andaman & Nicobar"
    case "NCT of Delhi":
    case "Delhi":
      return "Delhi"
    case "Dadara & Nagar Havelli":
    case "Dadra & Nagar Haveli":
    case "Dadra and Nagar Haveli and Daman and Diu":
      return "Dadra & Nagar Haveli"
    case "Daman & Diu":
      return "Daman & Diu"
    // Pre-2019 J&K covers both modern J&K and Ladakh in this topojson.
    case "Jammu & Kashmir":
    case "Ladakh":
      return "Jammu & Kashmir / Ladakh"
    default:
      return n
  }
}
