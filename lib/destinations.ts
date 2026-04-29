export const LOCATION_TYPES = [
  "Adventurous",
  "Calm",
  "Cultural",
  "Spiritual",
  "Beach",
  "Historical",
] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

export const WEATHER_CONDITIONS = [
  "Hot",
  "Cold",
  "Warm",
  "Rainy",
  "Mild",
  "Snowy",
] as const
export type Weather = (typeof WEATHER_CONDITIONS)[number]

export const BUDGET_RANGES = [
  "₹5K-10K",
  "₹8K-15K",
  "₹10K-20K",
  "₹15K-25K",
  "₹20K-30K",
  "₹30K-50K",
  "₹50K+",
] as const
export type Budget = (typeof BUDGET_RANGES)[number]

export const INDIAN_STATES = [
  "All States",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Puducherry",
  "Ladakh",
  "Andaman & Nicobar",
  "Lakshadweep",
] as const

/**
 * Visual identity for each Indian state — used by the state picker so every
 * state surfaces a recognisable emoji and one-liner that captures its travel
 * vibe. Falls back to a sensible default for any state not listed.
 */
export const STATE_META: Record<
  string,
  { emoji: string; tagline: string; region: "North" | "South" | "East" | "West" | "North-East" | "Central" | "Islands" }
> = {
  "Andhra Pradesh":    { emoji: "🛕", tagline: "Temple towns & coastal stretches", region: "South" },
  "Arunachal Pradesh": { emoji: "🌄", tagline: "Hidden valleys & tribal villages", region: "North-East" },
  "Assam":             { emoji: "🐘", tagline: "Tea, rhinos & the mighty Brahmaputra", region: "North-East" },
  "Bihar":             { emoji: "☸️", tagline: "Buddhist heartland", region: "East" },
  "Chhattisgarh":      { emoji: "🌳", tagline: "Tribal forests & waterfalls", region: "Central" },
  "Goa":               { emoji: "🏖️", tagline: "Konkan beaches & Portuguese vibes", region: "West" },
  "Gujarat":           { emoji: "🏜️", tagline: "White Rann & ancient ports", region: "West" },
  "Haryana":           { emoji: "🌾", tagline: "Northern plains", region: "North" },
  "Himachal Pradesh":  { emoji: "🏔️", tagline: "Snow peaks & pine valleys", region: "North" },
  "Jharkhand":         { emoji: "💎", tagline: "Forested plateaus", region: "East" },
  "Karnataka":         { emoji: "🏛️", tagline: "Hampi ruins & Western Ghats", region: "South" },
  "Kerala":            { emoji: "🌴", tagline: "Backwaters & spice hills", region: "South" },
  "Madhya Pradesh":    { emoji: "🐯", tagline: "Tiger reserves & temple towns", region: "Central" },
  "Maharashtra":       { emoji: "⛰️", tagline: "Sahyadri forts & Konkan coast", region: "West" },
  "Manipur":           { emoji: "🌊", tagline: "Floating islands of Loktak", region: "North-East" },
  "Meghalaya":         { emoji: "☔", tagline: "Living-root bridges & cleanest village", region: "North-East" },
  "Mizoram":           { emoji: "🌿", tagline: "Bamboo hills", region: "North-East" },
  "Nagaland":          { emoji: "🪶", tagline: "Hornbill country", region: "North-East" },
  "Odisha":            { emoji: "🌺", tagline: "Konark sun & tribal hills", region: "East" },
  "Punjab":            { emoji: "🌾", tagline: "Golden temple country", region: "North" },
  "Rajasthan":         { emoji: "🏰", tagline: "Forts, dunes & blue cities", region: "West" },
  "Sikkim":            { emoji: "🏔️", tagline: "Kanchenjunga monasteries", region: "North-East" },
  "Tamil Nadu":        { emoji: "🛕", tagline: "Dravidian temples & Nilgiris", region: "South" },
  "Telangana":         { emoji: "🏛️", tagline: "Charminar & Deccan plateau", region: "South" },
  "Tripura":           { emoji: "🏯", tagline: "Royal palaces", region: "North-East" },
  "Uttar Pradesh":     { emoji: "🪔", tagline: "Ganges, ghats & the Taj", region: "North" },
  "Uttarakhand":       { emoji: "🌲", tagline: "Char Dham & Himalayan hideouts", region: "North" },
  "West Bengal":       { emoji: "🚂", tagline: "Darjeeling tea & terracotta temples", region: "East" },
  "Puducherry":        { emoji: "☕", tagline: "French Riviera of India", region: "South" },
  "Ladakh":            { emoji: "❄️", tagline: "Cold desert & moon-like passes", region: "North" },
  "Andaman & Nicobar": { emoji: "🏝️", tagline: "Coral atolls & turquoise water", region: "Islands" },
  "Lakshadweep":       { emoji: "🐚", tagline: "Lagoon islands of the Arabian Sea", region: "Islands" },
}

export interface StateStat {
  state: string
  count: number
  avgRating: number
  topTypes: LocationType[]
}

/**
 * Aggregate stats per state from a list of destinations. Used by the
 * state picker to show counts, average rating, and dominant types.
 */
export function getStateStats(all: Destination[]): Map<string, StateStat> {
  const m = new Map<
    string,
    { count: number; ratingSum: number; types: Map<LocationType, number> }
  >()
  for (const d of all) {
    const cur = m.get(d.state) ?? { count: 0, ratingSum: 0, types: new Map() }
    cur.count += 1
    cur.ratingSum += d.rating
    cur.types.set(d.type, (cur.types.get(d.type) ?? 0) + 1)
    m.set(d.state, cur)
  }
  const out = new Map<string, StateStat>()
  for (const [state, v] of m) {
    const topTypes = [...v.types.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t)
    out.set(state, {
      state,
      count: v.count,
      avgRating: v.count > 0 ? v.ratingSum / v.count : 0,
      topTypes,
    })
  }
  return out
}

export interface Destination {
  id: number
  name: string
  state: string
  type: LocationType
  weather: Weather[]
  budget: Budget
  /** Curated fallback image (shown while Wikipedia image loads, or if it fails). */
  image: string
  /**
   * Wikipedia article title (URL-form, e.g. "Spiti_Valley"). When present,
   * the UI fetches the article's lead image and swaps it in over `image`.
   */
  wikiTitle?: string
  description: string
  tags: string[]
  bestTime: string
  rating: number
  addedBy?: string
  createdAt?: string
}

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"

const IMG = {
  himalaya:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  meadow:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  hillStation:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  forest:
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  cliffBeach:
    "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1200&q=80",
  desert:
    "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80",
  fort:
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  templeNorth:
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  templeSouth:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  ghats:
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  monastery:
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
  havelis:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  village:
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
  riverIsland:
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
  paragliding:
    "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80",
  snow:
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80",
  ruins:
    "https://images.unsplash.com/photo-1528150177508-7cc0c36cda5a?auto=format&fit=crop&w=1200&q=80",
  apple:
    "https://images.unsplash.com/photo-1541795083-1b160cf4f3d7?auto=format&fit=crop&w=1200&q=80",
}

const STORAGE_KEY = "hg.user-destinations"
const LIKES_KEY = "hg.likes"
const SAVES_KEY = "hg.saves"
const HISTORY_KEY = "hg.search-history"

const defaultDestinations: Destination[] = [
  // Existing curated set ───────────────────────────────────────────────
  { id: 1, name: "Ziro Valley", state: "Arunachal Pradesh", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg/800px-Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg", description: "Terraced rice fields of the Apatani tribe — a hauntingly beautiful valley surrounded by pine-covered hills, part of UNESCO's Tentative World Heritage list.", tags: ["tribal-culture", "rice-fields", "UNESCO-tentative"], bestTime: "Sep-Nov", rating: 4.7 },
  { id: 2, name: "Chopta & Tungnath", state: "Uttarakhand", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Tungnath_temple%2C_Chopta%2C_Uttarakhand.jpg/800px-Tungnath_temple%2C_Chopta%2C_Uttarakhand.jpg", description: "Alpine meadows and the world's highest Shiva temple — Chandrashila peak offers 360° Himalayan panoramas above the clouds.", tags: ["trekking", "spiritual", "alpine"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.8 },
  { id: 3, name: "Dzukou Valley", state: "Nagaland", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Dzukou_Valley_Nagaland.jpg/800px-Dzukou_Valley_Nagaland.jpg", description: "A pristine Himalayan valley that erupts with rare Dzukou lilies in summer. The 2-day trek delivers otherworldly green sweeping vistas.", tags: ["trekking", "wildflowers", "camping"], bestTime: "Jun-Sep", rating: 4.6 },
  { id: 4, name: "Spiti Valley", state: "Himachal Pradesh", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Key_monastery_%2851874557615%29.jpg/800px-Key_monastery_%2851874557615%29.jpg", description: "A cold desert at 12,500 ft with Key Monastery perched on a cliff. Ancient Buddhist villages, snow leopards, and the world's highest post office.", tags: ["offroad", "monastery", "high-altitude"], bestTime: "Jun-Sep", rating: 4.9 },
  { id: 5, name: "Sandakphu", state: "West Bengal", type: "Adventurous", weather: ["Cold", "Mild"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Sandakphu.jpg/800px-Sandakphu.jpg", description: "The highest peak in West Bengal showing 4 of the world's 5 highest mountains — Everest, Kangchenjunga, Lhotse, and Makalu.", tags: ["trekking", "himalayan-views", "rhododendron"], bestTime: "Apr-May, Oct-Nov", rating: 4.7 },
  { id: 6, name: "Munsiyari", state: "Uttarakhand", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Panchachuli_peak_from_Munsiyari.jpg/800px-Panchachuli_peak_from_Munsiyari.jpg", description: "Gateway to several high-altitude treks with jaw-dropping views of the five Panchachuli peaks. The last trading post on the ancient Silk Route.", tags: ["trekking", "glaciers", "remote"], bestTime: "Apr-Jun, Sep-Nov", rating: 4.6 },
  { id: 7, name: "Majuli Island", state: "Assam", type: "Calm", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Majuli_river_island_Assam_India.jpg/800px-Majuli_river_island_Assam_India.jpg", description: "The world's largest river island in the Brahmaputra — a sanctuary of Vaishnavite Satras, mask-making traditions, and extraordinary sunsets.", tags: ["river-island", "culture", "sunsets"], bestTime: "Nov-Mar", rating: 4.5 },
  { id: 8, name: "Gokarna", state: "Karnataka", type: "Calm", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Om_Beach%2C_Gokarna%2C_Karnataka%2C_India.jpg/800px-Om_Beach%2C_Gokarna%2C_Karnataka%2C_India.jpg", description: "A sacred temple town with Om Beach shaped like the Om symbol — far quieter than Goa with the same turquoise waters and sea cliffs.", tags: ["beach", "temple", "peaceful"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 9, name: "Tawang", state: "Arunachal Pradesh", type: "Calm", weather: ["Cold", "Mild"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Exterior_view_of_the_Tawang_Monastery.jpg/800px-Exterior_view_of_the_Tawang_Monastery.jpg", description: "India's largest Buddhist monastery at 10,000 ft, surrounded by glacial lakes, rhododendron forests, and cloud-draped peaks near the Bhutan border.", tags: ["monastery", "glacial-lakes", "tranquil"], bestTime: "Mar-Oct", rating: 4.8 },
  { id: 10, name: "Coorg (Kodagu)", state: "Karnataka", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Abbey_Falls%2C_Madikeri%2C_Coorg.jpg/800px-Abbey_Falls%2C_Madikeri%2C_Coorg.jpg", description: "Scotland of India — coffee and cardamom estates draped in mist, Abbey Falls roaring through the forest, and Kodava warrior hospitality.", tags: ["coffee-estates", "waterfalls", "misty"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 11, name: "Mawlynnong", state: "Meghalaya", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Living_Root_Bridge_in_Mawlynnong.jpg/800px-Living_Root_Bridge_in_Mawlynnong.jpg", description: "Asia's cleanest village, with living root bridges woven over centuries by the Khasi people — a community forest so pristine it shames cities.", tags: ["cleanest-village", "root-bridges", "community"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 12, name: "Khajjiar", state: "Himachal Pradesh", type: "Calm", weather: ["Cold", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Khajjiar_lake_%28Khajjiar%2C_India%29.jpg/800px-Khajjiar_lake_%28Khajjiar%2C_India%29.jpg", description: "India's own Mini Switzerland — a circular lake meadow surrounded by dense cedar forests and the snow-capped Dhauladhar range above Dalhousie.", tags: ["meadow", "cedar-forest", "snow-views"], bestTime: "Apr-Jun", rating: 4.5 },
  { id: 13, name: "Hampi", state: "Karnataka", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Virupaksha_Temple_and_Bazar%2C_Hampi%2C_Karnataka.JPG/800px-Virupaksha_Temple_and_Bazar%2C_Hampi%2C_Karnataka.JPG", description: "A UNESCO World Heritage Site — ruined capital of the Vijayanagara Empire scattered across surreal boulder landscapes. Every stone tells a 500-year story.", tags: ["UNESCO", "ruins", "architecture"], bestTime: "Oct-Feb", rating: 4.9 },
  { id: 14, name: "Orchha", state: "Madhya Pradesh", type: "Cultural", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Orchha_Fort_and_temples.jpg/800px-Orchha_Fort_and_temples.jpg", description: "A forgotten medieval city where 17th-century cenotaphs line the Betwa river and Bundela palaces stand un-renovated — time frozen in amber.", tags: ["medieval", "cenotaphs", "fort"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 15, name: "Pattadakal", state: "Karnataka", type: "Cultural", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pattadakal_temple_complex.jpg/800px-Pattadakal_temple_complex.jpg", description: "UNESCO-listed ensemble of 8th-century Chalukya temples that uniquely fuse northern Nagara and southern Dravida architectural styles in one site.", tags: ["UNESCO", "temples", "chalukya"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 16, name: "Bishnupur", state: "West Bengal", type: "Cultural", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bishnupur_Ras_mancha%2C_West_Bengal.jpg/800px-Bishnupur_Ras_mancha%2C_West_Bengal.jpg", description: "Terracotta temples of the Malla kings — Bengal's best-kept cultural secret where Bishnupuri silk weaving and Dhrupad classical music were born.", tags: ["terracotta-temples", "silk", "music"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 17, name: "Chettinad", state: "Tamil Nadu", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Chettinad_house.jpg/800px-Chettinad_house.jpg", description: "A region of palatial mansions built with Burmese teak and Italian marble by merchant princes, and a spice-heavy cuisine that changed world cooking.", tags: ["mansions", "cuisine", "heritage"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 18, name: "Mandu", state: "Madhya Pradesh", type: "Cultural", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jahaz_Mahal%2C_Mandu%2C_M.P.jpg/800px-Jahaz_Mahal%2C_Mandu%2C_M.P.jpg", description: "A hilltop fortress city with the ship-shaped Jahaz Mahal and legendary love story of Baz Bahadur and Rani Roopmati — monsoon turns it magical.", tags: ["fortress", "afghan-architecture", "romance"], bestTime: "Jul-Mar", rating: 4.6 },
  { id: 19, name: "Varanasi Hidden Ghats", state: "Uttar Pradesh", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Varanasi%2C_India_%2822906469774%29.jpg/800px-Varanasi%2C_India_%2822906469774%29.jpg", description: "Beyond Dashashwamedh — explore Harishchandra Ghat at 4am, Asi Ghat at sunrise, and the 84 ghats where daily rituals unfold without tourists.", tags: ["ghats", "aarti", "ancient"], bestTime: "Oct-Mar", rating: 4.8 },
  { id: 20, name: "Omkareshwar", state: "Madhya Pradesh", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Omkareshwar_temple.jpg/800px-Omkareshwar_temple.jpg", description: "A sacred island shaped like the Om symbol at the Narmada-Kaveri confluence, home to one of the 12 Jyotirlingas — one of India's most profound pilgrimage sites.", tags: ["jyotirlinga", "narmada", "island-temple"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 21, name: "Spituk Monastery", state: "Ladakh", type: "Spiritual", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Spituk_Gompa%2C_Ladakh.jpg/800px-Spituk_Gompa%2C_Ladakh.jpg", description: "Yellow Hat monastery perched dramatically above the Indus Valley with its fierce Kali idol revealed only once a year during the Gustor festival.", tags: ["monastery", "tantric", "festival"], bestTime: "Jun-Sep", rating: 4.8 },
  { id: 22, name: "Gupteswar Caves", state: "Odisha", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Gupteswar_Shiv_Temple%2C_Jeypore.jpg/800px-Gupteswar_Shiv_Temple%2C_Jeypore.jpg", description: "Sacred cave shrine with a naturally-formed Shiva linga deep within limestone caves, located beside the roaring Machkund waterfall in tribal Odisha.", tags: ["cave-shrine", "waterfall", "tribal-region"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 23, name: "Kamakhya Temple", state: "Assam", type: "Spiritual", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Kamakhya_Temple%2C_Guwahati.jpg/800px-Kamakhya_Temple%2C_Guwahati.jpg", description: "One of 51 Shakti Peethas on Nilachal Hill — the Kamakhya complex has lesser-known satellite temples to the 10 Mahavidyas, and hosts the Ambubachi Mela.", tags: ["shakti-peetha", "tantric", "goddess"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 24, name: "Somnath Temple", state: "Gujarat", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Somnath_temple_Gujarat.jpg/800px-Somnath_temple_Gujarat.jpg", description: "The first Jyotirlinga rebuilt 17 times after invasions — the Bhalka Tirth where Lord Krishna was wounded and the Triveni Sangam are rarely explored by tourists.", tags: ["jyotirlinga", "krishna", "sea-temple"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 25, name: "Havelock Island", state: "Andaman & Nicobar", type: "Beach", weather: ["Warm", "Hot"], budget: "₹20K-30K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Radhanagar_beach.jpg/800px-Radhanagar_beach.jpg", description: "Radhanagar Beach — Asia's best beach — with bioluminescent plankton at night, elephant snorkeling, and coral so vibrant it looks hand-painted.", tags: ["snorkeling", "bioluminescence", "pristine"], bestTime: "Oct-May", rating: 4.9 },
  { id: 26, name: "Varkala", state: "Kerala", type: "Beach", weather: ["Warm", "Hot"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Varkala_beach%2C_Kerala.jpg/800px-Varkala_beach%2C_Kerala.jpg", description: "Red laterite cliffs towering above the Arabian Sea with natural freshwater springs flowing onto the beach below — geologically unique in all of India.", tags: ["cliff-beach", "yoga", "ayurveda"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 27, name: "Tarkarli", state: "Maharashtra", type: "Beach", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Karli_river_meeting_Arabian_sea_Tarkarli.jpg/800px-Karli_river_meeting_Arabian_sea_Tarkarli.jpg", description: "Where the Karli river meets the Arabian sea — Maharashtra's most untouched beach with crystal-clear waters perfect for snorkeling and glass-bottom boats.", tags: ["snorkeling", "river-meets-sea", "peaceful"], bestTime: "Oct-May", rating: 4.6 },
  { id: 28, name: "Agonda Beach", state: "Goa", type: "Beach", weather: ["Warm", "Hot"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Agonda_beach_Goa.jpg/800px-Agonda_beach_Goa.jpg", description: "Goa's most serene beach — the anti-Baga. A nesting site for Olive Ridley turtles with minimal crowds, stunning sunsets, and fishing village life.", tags: ["turtle-nesting", "serene", "sunset"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 29, name: "Bangaram Atoll", state: "Lakshadweep", type: "Beach", weather: ["Warm", "Hot"], budget: "₹30K-50K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bangaram_island.jpg/800px-Bangaram_island.jpg", description: "An uninhabited coral atoll in the Arabian Sea with fluorescent lagoons. Only one eco-resort exists. Untouched reefs make this India's finest diving destination.", tags: ["coral-atoll", "diving", "uninhabited"], bestTime: "Oct-May", rating: 5.0 },
  { id: 30, name: "Mandarmani", state: "West Bengal", type: "Beach", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Mandarmani_sea_beach.jpg/800px-Mandarmani_sea_beach.jpg", description: "Bengal's longest motorable beach at 13 km — lined with red crabs at dawn, fishing villages, and seafood shacks. A true alternative to Goa's crowds.", tags: ["red-crabs", "long-beach", "fishing"], bestTime: "Oct-Mar", rating: 4.4 },
  { id: 31, name: "Lothal", state: "Gujarat", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Lothal_dockyard.jpg/800px-Lothal_dockyard.jpg", description: "One of the oldest planned cities on Earth — a 4,500-year-old Indus Valley port city with the world's first tidal dock and a grid-planned street layout.", tags: ["indus-valley", "ancient-port", "archaeology"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 32, name: "Mandu Historical", state: "Madhya Pradesh", type: "Historical", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jahaz_Mahal%2C_Mandu%2C_M.P.jpg/800px-Jahaz_Mahal%2C_Mandu%2C_M.P.jpg", description: "A spectacular 12th-16th century hilltop fortress city with Afghan-Mughal architecture — the ship-shaped Jahaz Mahal hosts a fleet of rooms built for the harem.", tags: ["fortress", "mughal", "ruins"], bestTime: "Jul-Mar", rating: 4.7 },
  { id: 33, name: "Chitradurga Fort", state: "Karnataka", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Chitradurga_fort2.jpg/800px-Chitradurga_fort2.jpg", description: "The Stone Fortress — seven layers of concentric granite walls built by successive dynasties over 500 years, with 19 temples and 4 secret gateways.", tags: ["fort", "seven-walls", "dynasties"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 34, name: "Srirangapatna", state: "Karnataka", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ranganathaswamy_Temple%2C_Srirangapatna.jpg/800px-Ranganathaswamy_Temple%2C_Srirangapatna.jpg", description: "Tipu Sultan's island capital on the Kaveri river — his summer palace, dungeons, mosque, and the exact spot of his legendary last stand in 1799.", tags: ["tipu-sultan", "island-fort", "colonial"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 35, name: "Dholavira", state: "Gujarat", type: "Historical", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Dholavira_excavation_site.jpg/800px-Dholavira_excavation_site.jpg", description: "A UNESCO-listed Harappan city in the Rann of Kutch — only site with a large Indus script inscription, and a 5,000-year-old water conservation marvel.", tags: ["UNESCO", "harappan", "water-system"], bestTime: "Oct-Feb", rating: 4.7 },
  { id: 36, name: "Bishnupur Temples", state: "West Bengal", type: "Historical", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bishnupur_Ras_mancha%2C_West_Bengal.jpg/800px-Bishnupur_Ras_mancha%2C_West_Bengal.jpg", description: "17th-century Malla kingdom temples built entirely of terracotta bricks, depicting Mahabharata and Ramayana scenes in intricate folk art carvings.", tags: ["terracotta", "malla-kingdom", "folk-art"], bestTime: "Oct-Mar", rating: 4.5 },

  // ── Himachal Pradesh expansion ─────────────────────────────────────
  { id: 37, name: "Tirthan Valley", state: "Himachal Pradesh", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.forest, description: "A trout-stream valley on the edge of Great Himalayan National Park — wooden riverside cottages, slow days, and zero tourist crowds.", tags: ["river-valley", "national-park", "off-grid"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.7 },
  { id: 38, name: "Bir Billing", state: "Himachal Pradesh", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹10K-20K", image: IMG.paragliding, description: "World's second-highest paragliding launch site — soar over the Dhauladhars and land in tea gardens. Tibetan monasteries quietly tucked between.", tags: ["paragliding", "monastery", "tea-gardens"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.8 },
  { id: 39, name: "Chitkul", state: "Himachal Pradesh", type: "Calm", weather: ["Cold", "Snowy"], budget: "₹10K-20K", image: IMG.village, description: "The last inhabited village before the Tibet border — wooden Kinnauri homes, Baspa river, and an air thinner than your worries.", tags: ["last-village", "kinnauri", "border"], bestTime: "May-Oct", rating: 4.7 },
  { id: 40, name: "Kasol & Tosh", state: "Himachal Pradesh", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.meadow, description: "Parvati valley villages of pine forests and mountain cafés — slow Israeli breakfasts, riverside camps, and walks to Tosh and Kheerganga.", tags: ["parvati-valley", "cafés", "trekking"], bestTime: "Apr-Jun, Sep-Nov", rating: 4.5 },
  { id: 41, name: "Pin Valley", state: "Himachal Pradesh", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: IMG.snow, description: "A cold-desert national park where Spiti's only forests grow — snow leopard country, ibex herds and a single road that ends at Mud village.", tags: ["snow-leopard", "national-park", "remote"], bestTime: "Jun-Sep", rating: 4.8 },

  // ── Uttarakhand expansion ──────────────────────────────────────────
  { id: 42, name: "Auli", state: "Uttarakhand", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: IMG.snow, description: "India's premier ski slope — gondolas above oak-conifer forests with Nanda Devi's twin peaks watching over every turn you carve.", tags: ["skiing", "gondola", "nanda-devi"], bestTime: "Dec-Mar", rating: 4.7 },
  { id: 43, name: "Binsar", state: "Uttarakhand", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.forest, description: "A 19th-century summer capital turned wildlife sanctuary — 300 km of Himalayan ridges visible on a clear morning, leopards in the oaks.", tags: ["wildlife-sanctuary", "ridge-views", "colonial"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.6 },
  { id: 44, name: "Kanatal", state: "Uttarakhand", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.meadow, description: "An apple-orchard village above Tehri lake — quieter than Mussoorie, with Surkanda Devi temple, pine treks and surreal stargazing.", tags: ["apple-orchards", "stargazing", "lake"], bestTime: "Mar-Jun, Sep-Dec", rating: 4.5 },
  { id: 45, name: "Mukteshwar", state: "Uttarakhand", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.apple, description: "A Himalayan ridge of pine and apple orchards crowned by a 350-year-old Shiva temple — postcard sunsets and zero hill-station noise.", tags: ["temple", "orchards", "ridge"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.6 },
  { id: 46, name: "Lansdowne", state: "Uttarakhand", type: "Calm", weather: ["Mild", "Cold"], budget: "₹5K-10K", image: IMG.hillStation, description: "A British-era cantonment frozen in time — colonial bungalows, slate-roofed churches and pine walks the army still maintains beautifully.", tags: ["colonial", "cantonment", "no-traffic"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.5 },

  // ── Sikkim ──────────────────────────────────────────────────────────
  { id: 47, name: "Yuksom", state: "Sikkim", type: "Cultural", weather: ["Mild", "Cold"], budget: "₹10K-20K", image: IMG.monastery, description: "The first capital of Sikkim — the Goecha La trek begins here, past 17th-century monasteries and the sacred coronation throne.", tags: ["historic-capital", "trek-base", "monastery"], bestTime: "Mar-May, Oct-Nov", rating: 4.7 },
  { id: 48, name: "Pelling", state: "Sikkim", type: "Calm", weather: ["Mild", "Cold"], budget: "₹10K-20K", image: IMG.himalaya, description: "Wake to Khangchendzonga filling your window — sunrise over Pemayangtse Monastery and a clifftop Skywalk like nothing else in India.", tags: ["khangchendzonga", "skywalk", "monastery"], bestTime: "Mar-May, Oct-Dec", rating: 4.6 },
  { id: 49, name: "Lachung & Yumthang", state: "Sikkim", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: IMG.snow, description: "The Valley of Flowers of the East — rhododendron blooms in May, snow ramps in winter and a glacier-fed hot spring at the end of the road.", tags: ["valley-of-flowers", "hot-springs", "glacier"], bestTime: "Mar-Jun, Oct-Dec", rating: 4.8 },
  { id: 50, name: "Zuluk", state: "Sikkim", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: IMG.himalaya, description: "A village on the old Silk Route with 32 hairpin bends — clouds wrap the road, red pandas hide in the forest, and Kanchenjunga floats above.", tags: ["silk-route", "hairpins", "red-panda"], bestTime: "Apr-May, Sep-Dec", rating: 4.7 },
  { id: 51, name: "Ravangla", state: "Sikkim", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.meadow, description: "A small ridge town between Maenam and Tendong hills — the 130-foot Buddha statue gazes calmly over tea gardens and prayer-flag-strung valleys.", tags: ["buddha-park", "tea-gardens", "ridge"], bestTime: "Mar-May, Oct-Dec", rating: 4.5 },

  // ── Kerala expansion ────────────────────────────────────────────────
  { id: 52, name: "Wayanad", state: "Kerala", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹10K-20K", image: IMG.forest, description: "A high-plateau tribal district of bamboo forests, rock-cut Edakkal caves and Banasura — India's largest earthen dam — wrapped in mist.", tags: ["plateau", "caves", "tribal"], bestTime: "Sep-May", rating: 4.7 },
  { id: 53, name: "Athirappilly Falls", state: "Kerala", type: "Calm", weather: ["Rainy", "Warm"], budget: "₹5K-10K", image: IMG.forest, description: "Kerala's Niagara — a 25-metre cascade over rainforest cliffs that explodes into mist during monsoon. Hornbills and elephants share the canopy.", tags: ["waterfall", "rainforest", "monsoon"], bestTime: "Jun-Jan", rating: 4.6 },
  { id: 54, name: "Bekal", state: "Kerala", type: "Beach", weather: ["Warm", "Rainy"], budget: "₹8K-15K", image: IMG.fort, description: "A 17th-century laterite sea-fort surrounded by empty beaches and backwaters — the quieter, slower face of north Kerala.", tags: ["sea-fort", "backwaters", "uncrowded"], bestTime: "Sep-May", rating: 4.6 },
  { id: 55, name: "Marari Beach", state: "Kerala", type: "Beach", weather: ["Warm", "Hot"], budget: "₹10K-20K", image: IMG.beach, description: "A fishing-village beach an hour from Kochi — coir hammocks, fresh karimeen curries and not a single high-rise to spoil the horizon.", tags: ["fishing-village", "homestays", "calm"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 56, name: "Vagamon", state: "Kerala", type: "Calm", weather: ["Mild", "Rainy"], budget: "₹8K-15K", image: IMG.meadow, description: "Rolling green meadows and pine forests in the Idukki highlands — paragliding launches and Kurisumala monastery's silent retreats.", tags: ["meadows", "paragliding", "monastery"], bestTime: "Sep-May", rating: 4.5 },

  // ── Tamil Nadu expansion ────────────────────────────────────────────
  { id: 57, name: "Yercaud", state: "Tamil Nadu", type: "Calm", weather: ["Mild", "Warm"], budget: "₹5K-10K", image: IMG.hillStation, description: "The Jewel of the South — coffee plantations and an emerald lake in the Shevaroy Hills, just four hours from Chennai but a world away.", tags: ["coffee", "lake", "shevaroy"], bestTime: "Sep-Jun", rating: 4.5 },
  { id: 58, name: "Valparai", state: "Tamil Nadu", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹8K-15K", image: IMG.forest, description: "Forty hairpin bends climb to a tea-plantation plateau where Asian elephants and lion-tailed macaques cross the road every other afternoon.", tags: ["tea-estates", "wildlife", "anamalai"], bestTime: "Sep-Mar", rating: 4.6 },
  { id: 59, name: "Kotagiri", state: "Tamil Nadu", type: "Calm", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: IMG.hillStation, description: "The oldest of the Nilgiri hill stations — small, slow, and surrounded by tea — with Catherine Falls and Kodanad Viewpoint nearby.", tags: ["nilgiris", "tea", "viewpoint"], bestTime: "Oct-Jun", rating: 4.5 },
  { id: 60, name: "Dhanushkodi", state: "Tamil Nadu", type: "Historical", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: IMG.beach, description: "A ghost town on a sandbar at the tip of India — the 1964 cyclone left a railway and a church to be slowly reclaimed by sand and sea.", tags: ["ghost-town", "ramayana", "sandbar"], bestTime: "Oct-Mar", rating: 4.6 },

  // ── Rajasthan ───────────────────────────────────────────────────────
  { id: 61, name: "Bundi", state: "Rajasthan", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: IMG.havelis, description: "A blue-painted town curling around step-wells beneath a fairytale fort — the Bundi murals are India's best-kept Rajput painting tradition.", tags: ["blue-town", "stepwells", "murals"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 62, name: "Mandawa", state: "Rajasthan", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: IMG.havelis, description: "An open-air gallery of frescoed havelis built by Marwari merchants — every wall in the Shekhawati region tells a 19th-century story.", tags: ["frescoes", "havelis", "shekhawati"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 63, name: "Kumbhalgarh", state: "Rajasthan", type: "Historical", weather: ["Hot", "Warm"], budget: "₹8K-15K", image: IMG.fort, description: "The Great Wall of India — 36 km of unbroken rampart wrapping a hilltop fortress, built by Maharana Kumbha and never breached.", tags: ["great-wall", "UNESCO", "fortress"], bestTime: "Oct-Mar", rating: 4.8 },
  { id: 64, name: "Bera", state: "Rajasthan", type: "Calm", weather: ["Hot", "Warm"], budget: "₹15K-25K", image: IMG.desert, description: "A Rabari shepherd country where wild leopards live on granite hills among the locals — the only place in India where they're truly habituated.", tags: ["leopards", "rabari", "granite-hills"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 65, name: "Khimsar", state: "Rajasthan", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹15K-25K", image: IMG.desert, description: "A 16th-century desert fort that's still a working village — sand-dune sundowners, Rajput hospitality and bishnoi blackbuck on the periphery.", tags: ["desert-fort", "bishnoi", "dunes"], bestTime: "Oct-Mar", rating: 4.6 },

  // ── Misc additions ──────────────────────────────────────────────────
  { id: 66, name: "Pachmarhi", state: "Madhya Pradesh", type: "Calm", weather: ["Mild", "Rainy"], budget: "₹5K-10K", image: IMG.forest, description: "MP's only hill station — Satpura sandstone gorges, Pandav caves and waterfalls hidden in dense sal forests.", tags: ["satpura", "caves", "waterfalls"], bestTime: "Oct-Jun", rating: 4.5 },
  { id: 67, name: "Daringbadi", state: "Odisha", type: "Calm", weather: ["Mild", "Cold"], budget: "₹5K-10K", image: IMG.hillStation, description: "Kashmir of Odisha — pine forests at 3,000 ft where temperatures drop to freezing, coffee estates and unexpected snowfall once a decade.", tags: ["pine-forests", "coffee", "kondh-tribe"], bestTime: "Oct-Feb", rating: 4.4 },
  { id: 68, name: "Velas Beach", state: "Maharashtra", type: "Beach", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: IMG.beach, description: "A Konkan fishing village famous for the annual Olive Ridley turtle hatchling release every February-March — a community-run conservation gem.", tags: ["turtle-festival", "konkan", "homestays"], bestTime: "Nov-Mar", rating: 4.6 },
  { id: 69, name: "Cola Beach", state: "Goa", type: "Beach", weather: ["Warm", "Hot"], budget: "₹10K-20K", image: IMG.cliffBeach, description: "South Goa's secret — a tiny crescent of sand with a freshwater lagoon snaking right up to the surf. Reachable only by a 4×4 dirt track.", tags: ["lagoon", "secluded", "south-goa"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 70, name: "Maheshwar", state: "Madhya Pradesh", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: IMG.ghats, description: "Ahilyabai Holkar's riverside city on the Narmada — sandstone ghats, hand-loom Maheshwari sarees and aarti reflected on the water at dusk.", tags: ["ghats", "saree-weaving", "narmada"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 71, name: "Pelling Skywalk Trail", state: "Sikkim", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹10K-20K", image: IMG.himalaya, description: "Beyond the town — Rabdentse ruins, Kanchenjunga Falls and the Sangachoeling pilgrim hike give Pelling 3 days of itineraries.", tags: ["ruins", "pilgrim-trail", "waterfall"], bestTime: "Mar-May, Oct-Dec", rating: 4.5 },
]

// ─────────── Wikipedia article mapping ──────────────────────────────────
//
// Maps each curated destination id to its Wikipedia article title (URL form).
// The UI uses this to fetch the article's lead image at runtime via the
// public REST API, giving us accurate, editor-curated photos with no API
// key. If a title 404s, the destination's `image` field is used as fallback.

const WIKI_TITLES: Record<number, string> = {
  1: "Ziro",
  2: "Tungnath",
  3: "Dzukou_Valley",
  4: "Spiti_Valley",
  5: "Sandakphu",
  6: "Munsiyari",
  7: "Majuli",
  8: "Gokarna,_Karnataka",
  9: "Tawang",
  10: "Kodagu_district",
  11: "Mawlynnong",
  12: "Khajjiar",
  13: "Hampi",
  14: "Orchha",
  15: "Pattadakal",
  16: "Bishnupur,_Bankura",
  17: "Chettinad",
  18: "Mandu,_Madhya_Pradesh",
  19: "Ghats_in_Varanasi",
  20: "Omkareshwar",
  21: "Spituk_Monastery",
  22: "Gupteswar_Cave",
  23: "Kamakhya_Temple",
  24: "Somnath_temple",
  25: "Swaraj_Dweep",
  26: "Varkala",
  27: "Tarkarli",
  28: "Agonda",
  29: "Bangaram_Island",
  30: "Mandarmani",
  31: "Lothal",
  32: "Mandu,_Madhya_Pradesh",
  33: "Chitradurga_Fort",
  34: "Srirangapatna",
  35: "Dholavira",
  36: "Bishnupur,_Bankura",
  37: "Great_Himalayan_National_Park",
  38: "Bir,_Himachal_Pradesh",
  39: "Chitkul",
  40: "Kasol",
  41: "Pin_Valley_National_Park",
  42: "Auli,_India",
  43: "Binsar",
  44: "Kanatal",
  45: "Mukteshwar",
  46: "Lansdowne,_India",
  47: "Yuksom",
  48: "Pelling",
  49: "Lachung",
  50: "Zuluk",
  51: "Ravangla",
  52: "Wayanad_district",
  53: "Athirappilly_Falls",
  54: "Bekal_Fort",
  55: "Mararikulam",
  56: "Vagamon",
  57: "Yercaud",
  58: "Valparai",
  59: "Kotagiri",
  60: "Dhanushkodi",
  61: "Bundi",
  62: "Mandawa",
  63: "Kumbhalgarh",
  64: "Jawai_Bandh",
  65: "Khimsar",
  66: "Pachmarhi",
  67: "Daringbadi",
  68: "Velas,_Maharashtra",
  69: "Cola_Beach",
  70: "Maheshwar",
  71: "Pelling",
}

/** Decorate a destination with its Wikipedia title if we know one. */
function withWiki(d: Destination): Destination {
  if (d.wikiTitle) return d
  const title = WIKI_TITLES[d.id]
  return title ? { ...d, wikiTitle: title } : d
}

// ─────────── Catalogue access ───────────────────────────────────────────

export function getDefaultDestinations(): Destination[] {
  return defaultDestinations.map(withWiki)
}

export function getUserDestinations(): Destination[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Destination[]) : []
  } catch {
    return []
  }
}

export function getAllDestinations(): Destination[] {
  const decorated = defaultDestinations.map(withWiki)
  if (typeof window === "undefined") return decorated
  return [...getUserDestinations(), ...decorated]
}

export function addDestination(
  input: Omit<Destination, "id" | "createdAt">,
): Destination {
  const existing = getUserDestinations()
  const allKnownIds = [...defaultDestinations, ...existing].map((d) => d.id)
  const nextId = (allKnownIds.length ? Math.max(...allKnownIds) : 0) + 1
  const created: Destination = {
    ...input,
    id: nextId,
    createdAt: new Date().toISOString(),
  }
  const next = [created, ...existing]
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return created
}

export function getDestinationById(id: number): Destination | undefined {
  return getAllDestinations().find((d) => d.id === id)
}

// ─────────── Search & ranking ───────────────────────────────────────────

const SYNONYMS: Array<[RegExp, Partial<Record<LocationType, number>>]> = [
  [/comfortable|relax|peaceful|chill|tranquil|quiet|slow/, { Calm: 5 }],
  [/adventure|trek|trekking|hiking|offroad|skiing|paragliding|raft/, { Adventurous: 5 }],
  [/spiritual|temple|monaster|pilgrim|aarti|jyotirling/, { Spiritual: 5 }],
  [/beach|sea|ocean|coral|snorkel|island|sand/, { Beach: 5 }],
  [/cultural|culture|heritage|art|fresco|haveli|tradition/, { Cultural: 5 }],
  [/historic|fort|ancient|ruin|archae/, { Historical: 5 }],
]

const BUDGET_TOKENS: Array<[RegExp, Budget[]]> = [
  [/cheap|budget|low|affordable|under\s*10|10k|under\s*15|15k/, ["₹5K-10K", "₹8K-15K"]],
  [/mid|moderate|20k|25k/, ["₹10K-20K", "₹15K-25K"]],
  [/premium|luxury|expensive|high|30k|50k/, ["₹20K-30K", "₹30K-50K", "₹50K+"]],
]

const WEATHER_TOKENS: Array<[RegExp, Weather]> = [
  [/snow|skiing/, "Snowy"],
  [/cold|chilly|winter/, "Cold"],
  [/warm/, "Warm"],
  [/hot|summer/, "Hot"],
  [/rain|monsoon|wet/, "Rainy"],
  [/mild|cool|spring/, "Mild"],
]

export type SortMode = "relevance" | "rating" | "name"

export interface SearchInputs {
  query: string
  type: LocationType | null
  weather: Weather | null
  state: string | null
  budget: Budget | null
  /** 1–12 (Jan–Dec). Filters to destinations whose `bestTime` window contains this month. */
  month?: number | null
  /** 0–5. Inclusive lower bound on `rating`. */
  minRating?: number | null
  /** Primary sort. Defaults to "relevance". */
  sort?: SortMode
}

export interface RankedResult {
  destination: Destination
  score: number
}

export function rankDestinations(
  all: Destination[],
  inputs: SearchInputs,
): { ranked: RankedResult[]; relaxed: boolean } {
  const q = inputs.query.toLowerCase().trim()
  const tokens = q.split(/[\s,]+/).filter(Boolean)
  const sort: SortMode = inputs.sort ?? "relevance"

  const passesMonth = (d: Destination) => {
    if (!inputs.month) return true
    const months = parseBestMonths(d.bestTime)
    return months.length === 0 || months.includes(inputs.month)
  }
  const passesMinRating = (d: Destination) =>
    !inputs.minRating || d.rating >= inputs.minRating

  const passesHard = (d: Destination) => {
    if (inputs.type && d.type !== inputs.type) return false
    if (inputs.weather && !d.weather.includes(inputs.weather)) return false
    if (inputs.state && d.state !== inputs.state) return false
    if (inputs.budget && d.budget !== inputs.budget) return false
    if (!passesMonth(d)) return false
    if (!passesMinRating(d)) return false
    return true
  }

  const sorter = (a: RankedResult, b: RankedResult) => {
    if (sort === "name")
      return a.destination.name.localeCompare(b.destination.name)
    if (sort === "rating")
      return (
        b.destination.rating - a.destination.rating ||
        b.score - a.score
      )
    return b.score - a.score || b.destination.rating - a.destination.rating
  }

  const queryScore = (d: Destination): number => {
    if (tokens.length === 0) return 1
    const hay = [
      d.name,
      d.state,
      d.type,
      d.budget,
      d.bestTime,
      d.weather.join(" "),
      d.tags.join(" "),
      d.description,
    ]
      .join(" ")
      .toLowerCase()

    let score = 0
    for (const t of tokens) {
      if (!t) continue
      if (d.state.toLowerCase().includes(t)) score += 6
      if (d.name.toLowerCase().includes(t)) score += 5
      if (d.type.toLowerCase() === t) score += 4
      if (d.weather.some((w) => w.toLowerCase() === t)) score += 3
      if (d.budget.toLowerCase().includes(t)) score += 3
      if (d.tags.some((tag) => tag.toLowerCase().includes(t))) score += 3
      if (d.bestTime.toLowerCase().includes(t)) score += 2
      if (hay.includes(t)) score += 1
    }
    for (const [re, boosts] of SYNONYMS) {
      if (re.test(q)) {
        const b = boosts[d.type as LocationType]
        if (b) score += b
      }
    }
    for (const [re, budgets] of BUDGET_TOKENS) {
      if (re.test(q) && budgets.includes(d.budget)) score += 4
    }
    for (const [re, w] of WEATHER_TOKENS) {
      if (re.test(q) && d.weather.includes(w)) score += 3
    }
    return score
  }

  const strict = all
    .filter(passesHard)
    .map((d) => ({ destination: d, score: queryScore(d) }))
    .filter((r) => tokens.length === 0 || r.score > 0)
    .sort(sorter)

  if (strict.length >= 5 || tokens.length === 0) {
    return { ranked: strict, relaxed: false }
  }

  // Relax filters one at a time, keeping query relevance.
  // Hard caps (state, minRating, month) come first since they tend to be the
  // most aggressive; type is preserved longest because it usually maps to the
  // user's intent.
  const relaxOrder: Array<keyof SearchInputs> = [
    "budget",
    "month",
    "minRating",
    "state",
    "weather",
    "type",
  ]
  let working: SearchInputs = { ...inputs }
  for (const k of relaxOrder) {
    working = { ...working, [k]: null } as SearchInputs
    const relaxed = all
      .filter((d) => {
        if (working.type && d.type !== working.type) return false
        if (working.weather && !d.weather.includes(working.weather)) return false
        if (working.state && d.state !== working.state) return false
        if (working.budget && d.budget !== working.budget) return false
        if (working.month) {
          const months = parseBestMonths(d.bestTime)
          if (months.length > 0 && !months.includes(working.month)) return false
        }
        if (working.minRating && d.rating < working.minRating) return false
        return true
      })
      .map((d) => ({ destination: d, score: queryScore(d) }))
      .filter((r) => r.score > 0)
      .sort(sorter)
    if (relaxed.length >= 5) return { ranked: relaxed, relaxed: true }
  }

  // Last resort: query-only
  return {
    ranked: all
      .map((d) => ({ destination: d, score: queryScore(d) }))
      .filter((r) => r.score > 0)
      .sort(sorter),
    relaxed: true,
  }
}

// ─────────── Months & seasons ───────────────────────────────────────────

const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

export function parseBestMonths(bestTime: string): number[] {
  const out = new Set<number>()
  for (const range of bestTime.toLowerCase().split(",").map((s) => s.trim())) {
    const parts = range.split("-").map((s) => s.trim())
    if (parts.length === 1) {
      const m = MONTH_INDEX[parts[0].slice(0, 3)]
      if (m) out.add(m)
    } else if (parts.length === 2) {
      const a = MONTH_INDEX[parts[0].slice(0, 3)]
      const b = MONTH_INDEX[parts[1].slice(0, 3)]
      if (a && b) {
        if (a <= b) for (let i = a; i <= b; i++) out.add(i)
        else {
          for (let i = a; i <= 12; i++) out.add(i)
          for (let i = 1; i <= b; i++) out.add(i)
        }
      }
    }
  }
  return Array.from(out).sort((x, y) => x - y)
}

export function monthName(m: number): string {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] ?? ""
}

// ─────────── Recommendations ────────────────────────────────────────────

export interface SearchHistoryEntry {
  query: string
  type: LocationType | null
  state: string | null
  budget: Budget | null
  at: number
}

export function pushSearchHistory(entry: Omit<SearchHistoryEntry, "at">) {
  if (typeof window === "undefined") return
  if (!entry.query && !entry.type && !entry.state && !entry.budget) return
  try {
    const prev = readSearchHistory()
    const next = [{ ...entry, at: Date.now() }, ...prev].slice(0, 30)
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    /* noop */
  }
}

export function readSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SearchHistoryEntry[]) : []
  } catch {
    return []
  }
}

export interface Recommendation {
  destination: Destination
  reason: string
  forMonth: number
}

/**
 * Generate season-aware recommendations.
 * - Looks ahead `lookahead` months from now (default 3) and returns gems whose
 *   best-time window overlaps the upcoming window.
 * - Boosted by the user's recent search history (matched type / state / budget).
 */
export function getRecommendations(
  all: Destination[],
  history: SearchHistoryEntry[] = [],
  options: { now?: Date; lookahead?: number; limit?: number } = {},
): Recommendation[] {
  const now = options.now ?? new Date()
  const lookahead = options.lookahead ?? 3
  const limit = options.limit ?? 6

  const upcoming: number[] = []
  for (let i = 1; i <= lookahead; i++) {
    upcoming.push(((now.getMonth() + i) % 12) + 1)
  }

  // History weights (recent entries weigh more)
  const typeWeight: Partial<Record<LocationType, number>> = {}
  const stateWeight: Record<string, number> = {}
  const budgetWeight: Partial<Record<Budget, number>> = {}
  history.slice(0, 15).forEach((h, idx) => {
    const w = 15 - idx
    if (h.type) typeWeight[h.type] = (typeWeight[h.type] ?? 0) + w
    if (h.state) stateWeight[h.state] = (stateWeight[h.state] ?? 0) + w
    if (h.budget) budgetWeight[h.budget] = (budgetWeight[h.budget] ?? 0) + w
  })

  const scored: Array<{ d: Destination; score: number; matchedMonth: number }> = []

  for (const d of all) {
    const months = parseBestMonths(d.bestTime)
    const matched = months.find((m) => upcoming.includes(m))
    if (!matched) continue

    let score = d.rating * 2
    score += (typeWeight[d.type] ?? 0) * 1.5
    score += (stateWeight[d.state] ?? 0) * 1.2
    score += (budgetWeight[d.budget] ?? 0) * 1.0
    // Closer upcoming months matter more
    const nearness = lookahead - upcoming.indexOf(matched)
    score += nearness * 0.6
    scored.push({ d, score, matchedMonth: matched })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => ({
    destination: s.d,
    forMonth: s.matchedMonth,
    reason: `Great in ${monthName(s.matchedMonth)} · ${s.d.type.toLowerCase()} vibe`,
  }))
}

// ─────────── Likes ──────────────────────────────────────────────────────

export function readLikes(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(LIKES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as number[]) : []
  } catch {
    return []
  }
}

export function toggleLike(id: number): number[] {
  const cur = readLikes()
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LIKES_KEY, JSON.stringify(next))
  }
  return next
}

// ─────────── Saves (collections / themes) ──────────────────────────────

export type Saves = Record<string, number[]>

export function readSaves(): Saves {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(SAVES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? (parsed as Saves) : {}
  } catch {
    return {}
  }
}

export function writeSaves(s: Saves) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SAVES_KEY, JSON.stringify(s))
}

export function addSaveTo(theme: string, id: number): Saves {
  const cur = readSaves()
  const cleanTheme = theme.trim() || "Wishlist"
  const prev = cur[cleanTheme] ?? []
  const next: Saves = {
    ...cur,
    [cleanTheme]: prev.includes(id) ? prev : [id, ...prev],
  }
  writeSaves(next)
  return next
}

export function removeSaveFrom(theme: string, id: number): Saves {
  const cur = readSaves()
  if (!cur[theme]) return cur
  const next: Saves = { ...cur, [theme]: cur[theme].filter((x) => x !== id) }
  if (next[theme].length === 0) delete next[theme]
  writeSaves(next)
  return next
}

export function getThemesForId(saves: Saves, id: number): string[] {
  return Object.entries(saves)
    .filter(([, ids]) => ids.includes(id))
    .map(([name]) => name)
}

// ─────────── Maps URL helper ────────────────────────────────────────────

export function googleMapsUrl(d: Destination): string {
  const q = encodeURIComponent(`${d.name}, ${d.state}, India`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
