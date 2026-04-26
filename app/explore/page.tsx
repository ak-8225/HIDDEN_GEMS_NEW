"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Sparkles, X, Star, Calendar, Tag } from "lucide-react"
import type { Destination } from "@/lib/destinations"

const LOCATION_TYPES = ["Adventurous", "Calm", "Cultural", "Spiritual", "Beach", "Historical"]
const WEATHER_CONDITIONS = ["Hot", "Cold", "Warm", "Rainy", "Mild", "Snowy"]
const INDIAN_STATES = [
  "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Puducherry", "Ladakh", "Andaman & Nicobar", "Lakshadweep",
]
const BUDGET_RANGES = ["₹5K-10K", "₹8K-15K", "₹10K-20K", "₹15K-25K", "₹20K-30K", "₹30K-50K", "₹50K+"]

// 36 Indian Destinations - HARDCODED
const INDIAN_DESTINATIONS: Destination[] = [
  { id: 1, name: "Ziro Valley", state: "Arunachal Pradesh", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg/800px-Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg", description: "Terraced rice fields of the Apatani tribe surrounded by pine-covered hills.", tags: ["tribal-culture", "rice-fields", "UNESCO"], bestTime: "Sep-Nov", rating: 4.7 },
  { id: 2, name: "Chopta & Tungnath", state: "Uttarakhand", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Tungnath_temple%2C_Chopta%2C_Uttarakhand.jpg/800px-Tungnath_temple%2C_Chopta%2C_Uttarakhand.jpg", description: "Alpine meadows with the world's highest Shiva temple.", tags: ["trekking", "spiritual", "alpine"], bestTime: "Mar-Jun, Sep-Nov", rating: 4.8 },
  { id: 3, name: "Dzukou Valley", state: "Nagaland", type: "Adventurous", weather: ["Mild", "Cold"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Dzukou_Valley_Nagaland.jpg/800px-Dzukou_Valley_Nagaland.jpg", description: "Pristine Himalayan valley with rare wildflowers.", tags: ["trekking", "wildflowers", "camping"], bestTime: "Jun-Sep", rating: 4.6 },
  { id: 4, name: "Spiti Valley", state: "Himachal Pradesh", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Key_monastery_%2851874557615%29.jpg/800px-Key_monastery_%2851874557615%29.jpg", description: "Cold desert with Buddhist monasteries on cliffs.", tags: ["offroad", "monastery", "high-altitude"], bestTime: "Jun-Sep", rating: 4.9 },
  { id: 5, name: "Sandakphu", state: "West Bengal", type: "Adventurous", weather: ["Cold", "Mild"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Sandakphu.jpg/800px-Sandakphu.jpg", description: "Views of 4 of the world's 5 highest mountains.", tags: ["trekking", "himalayan-views", "rhododendron"], bestTime: "Apr-May, Oct-Nov", rating: 4.7 },
  { id: 6, name: "Munsiyari", state: "Uttarakhand", type: "Adventurous", weather: ["Cold", "Snowy"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Panchachuli_peak_from_Munsiyari.jpg/800px-Panchachuli_peak_from_Munsiyari.jpg", description: "Gateway to high-altitude treks with stunning peak views.", tags: ["trekking", "glaciers", "remote"], bestTime: "Apr-Jun, Sep-Nov", rating: 4.6 },
  { id: 7, name: "Majuli Island", state: "Assam", type: "Calm", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Majuli_river_island_Assam_India.jpg/800px-Majuli_river_island_Assam_India.jpg", description: "World's largest river island with Vaishnavite culture.", tags: ["river-island", "culture", "sunsets"], bestTime: "Nov-Mar", rating: 4.5 },
  { id: 8, name: "Gokarna", state: "Karnataka", type: "Calm", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Om_Beach%2C_Gokarna%2C_Karnataka%2C_India.jpg/800px-Om_Beach%2C_Gokarna%2C_Karnataka%2C_India.jpg", description: "Sacred temple town with Om Beach shaped like the Om symbol.", tags: ["beach", "temple", "peaceful"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 9, name: "Tawang", state: "Arunachal Pradesh", type: "Calm", weather: ["Cold", "Mild"], budget: "₹10K-20K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Exterior_view_of_the_Tawang_Monastery.jpg/800px-Exterior_view_of_the_Tawang_Monastery.jpg", description: "India's largest Buddhist monastery at 10,000 ft.", tags: ["monastery", "glacial-lakes", "tranquil"], bestTime: "Mar-Oct", rating: 4.8 },
  { id: 10, name: "Coorg (Kodagu)", state: "Karnataka", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Abbey_Falls%2C_Madikeri%2C_Coorg.jpg/800px-Abbey_Falls%2C_Madikeri%2C_Coorg.jpg", description: "Scotland of India with coffee estates and waterfalls.", tags: ["coffee-estates", "waterfalls", "misty"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 11, name: "Mawlynnong", state: "Meghalaya", type: "Calm", weather: ["Rainy", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Living_Root_Bridge_in_Mawlynnong.jpg/800px-Living_Root_Bridge_in_Mawlynnong.jpg", description: "Asia's cleanest village with living root bridges.", tags: ["cleanest-village", "root-bridges", "community"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 12, name: "Khajjiar", state: "Himachal Pradesh", type: "Calm", weather: ["Cold", "Mild"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Khajjiar_lake_%28Khajjiar%2C_India%29.jpg/800px-Khajjiar_lake_%28Khajjiar%2C_India%29.jpg", description: "India's Mini Switzerland with lake and cedar forests.", tags: ["meadow", "cedar-forest", "snow-views"], bestTime: "Apr-Jun", rating: 4.5 },
  { id: 13, name: "Hampi", state: "Karnataka", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Virupaksha_Temple_and_Bazar%2C_Hampi%2C_Karnataka.JPG/800px-Virupaksha_Temple_and_Bazar%2C_Hampi%2C_Karnataka.JPG", description: "UNESCO World Heritage site with Vijayanagara Empire ruins.", tags: ["UNESCO", "ruins", "architecture"], bestTime: "Oct-Feb", rating: 4.9 },
  { id: 14, name: "Orchha", state: "Madhya Pradesh", type: "Cultural", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Orchha_Fort_and_temples.jpg/800px-Orchha_Fort_and_temples.jpg", description: "Medieval city with cenotaphs and Bundela palaces.", tags: ["medieval", "cenotaphs", "fort"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 15, name: "Pattadakal", state: "Karnataka", type: "Cultural", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pattadakal_temple_complex.jpg/800px-Pattadakal_temple_complex.jpg", description: "UNESCO-listed 8th-century Chalukya temples.", tags: ["UNESCO", "temples", "chalukya"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 16, name: "Bishnupur", state: "West Bengal", type: "Cultural", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bishnupur_Ras_mancha%2C_West_Bengal.jpg/800px-Bishnupur_Ras_mancha%2C_West_Bengal.jpg", description: "Terracotta temples of Malla kings.", tags: ["terracotta-temples", "silk", "music"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 17, name: "Chettinad", state: "Tamil Nadu", type: "Cultural", weather: ["Hot", "Warm"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Chettinad_house.jpg/800px-Chettinad_house.jpg", description: "Palatial mansions with unique architecture.", tags: ["mansions", "cuisine", "heritage"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 18, name: "Mandu", state: "Madhya Pradesh", type: "Cultural", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jahaz_Mahal%2C_Mandu%2C_M.P.jpg/800px-Jahaz_Mahal%2C_Mandu%2C_M.P.jpg", description: "Hilltop fortress with ship-shaped Jahaz Mahal.", tags: ["fortress", "afghan-architecture", "romance"], bestTime: "Jul-Mar", rating: 4.6 },
  { id: 19, name: "Varanasi Hidden Ghats", state: "Uttar Pradesh", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Varanasi%2C_India_%2822906469774%29.jpg/800px-Varanasi%2C_India_%2822906469774%29.jpg", description: "Beyond Dashashwamedh - explore lesser-known ghats.", tags: ["ghats", "aarti", "ancient"], bestTime: "Oct-Mar", rating: 4.8 },
  { id: 20, name: "Omkareshwar", state: "Madhya Pradesh", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Omkareshwar_temple.jpg/800px-Omkareshwar_temple.jpg", description: "Sacred island shaped like Om symbol - one of 12 Jyotirlingas.", tags: ["jyotirlinga", "narmada", "island-temple"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 21, name: "Spituk Monastery", state: "Ladakh", type: "Spiritual", weather: ["Cold", "Snowy"], budget: "₹15K-25K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Spituk_Gompa%2C_Ladakh.jpg/800px-Spituk_Gompa%2C_Ladakh.jpg", description: "Yellow Hat monastery above Indus Valley.", tags: ["monastery", "tantric", "festival"], bestTime: "Jun-Sep", rating: 4.8 },
  { id: 22, name: "Gupteswar Caves", state: "Odisha", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Gupteswar_Shiv_Temple%2C_Jeypore.jpg/800px-Gupteswar_Shiv_Temple%2C_Jeypore.jpg", description: "Sacred cave shrine with Machkund waterfall.", tags: ["cave-shrine", "waterfall", "tribal-region"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 23, name: "Kamakhya Temple", state: "Assam", type: "Spiritual", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Kamakhya_Temple%2C_Guwahati.jpg/800px-Kamakhya_Temple%2C_Guwahati.jpg", description: "One of 51 Shakti Peethas on Nilachal Hill.", tags: ["shakti-peetha", "tantric", "goddess"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 24, name: "Somnath Temple", state: "Gujarat", type: "Spiritual", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Somnath_temple_Gujarat.jpg/800px-Somnath_temple_Gujarat.jpg", description: "First Jyotirlinga rebuilt 17 times after invasions.", tags: ["jyotirlinga", "krishna", "sea-temple"], bestTime: "Oct-Mar", rating: 4.7 },
  { id: 25, name: "Havelock Island", state: "Andaman & Nicobar", type: "Beach", weather: ["Warm", "Hot"], budget: "₹20K-30K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Radhanagar_beach.jpg/800px-Radhanagar_beach.jpg", description: "Asia's best beach - Radhanagar with bioluminescent plankton.", tags: ["snorkeling", "bioluminescence", "pristine"], bestTime: "Oct-May", rating: 4.9 },
  { id: 26, name: "Varkala", state: "Kerala", type: "Beach", weather: ["Warm", "Hot"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Varkala_beach%2C_Kerala.jpg/800px-Varkala_beach%2C_Kerala.jpg", description: "Red laterite cliffs above Arabian Sea with freshwater springs.", tags: ["cliff-beach", "yoga", "ayurveda"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 27, name: "Tarkarli", state: "Maharashtra", type: "Beach", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Karli_river_meeting_Arabian_sea_Tarkarli.jpg/800px-Karli_river_meeting_Arabian_sea_Tarkarli.jpg", description: "Where Karli river meets Arabian sea - crystal clear waters.", tags: ["snorkeling", "river-meets-sea", "peaceful"], bestTime: "Oct-May", rating: 4.6 },
  { id: 28, name: "Agonda Beach", state: "Goa", type: "Beach", weather: ["Warm", "Hot"], budget: "₹8K-15K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Agonda_beach_Goa.jpg/800px-Agonda_beach_Goa.jpg", description: "Goa's most serene beach - Olive Ridley turtle nesting site.", tags: ["turtle-nesting", "serene", "sunset"], bestTime: "Nov-Mar", rating: 4.7 },
  { id: 29, name: "Bangaram Atoll", state: "Lakshadweep", type: "Beach", weather: ["Warm", "Hot"], budget: "₹30K-50K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bangaram_island.jpg/800px-Bangaram_island.jpg", description: "Uninhabited coral atoll with pristine diving reefs.", tags: ["coral-atoll", "diving", "uninhabited"], bestTime: "Oct-May", rating: 5.0 },
  { id: 30, name: "Mandarmani", state: "West Bengal", type: "Beach", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Mandarmani_sea_beach.jpg/800px-Mandarmani_sea_beach.jpg", description: "Bengal's longest motorable beach at 13 km.", tags: ["red-crabs", "long-beach", "fishing"], bestTime: "Oct-Mar", rating: 4.4 },
  { id: 31, name: "Lothal", state: "Gujarat", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Lothal_dockyard.jpg/800px-Lothal_dockyard.jpg", description: "4,500-year-old Indus Valley port city with tidal dock.", tags: ["indus-valley", "ancient-port", "archaeology"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 32, name: "Mandu Historical", state: "Madhya Pradesh", type: "Historical", weather: ["Warm", "Rainy"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jahaz_Mahal%2C_Mandu%2C_M.P.jpg/800px-Jahaz_Mahal%2C_Mandu%2C_M.P.jpg", description: "12th-16th century hilltop fortress with Afghan-Mughal architecture.", tags: ["fortress", "mughal", "ruins"], bestTime: "Jul-Mar", rating: 4.7 },
  { id: 33, name: "Chitradurga Fort", state: "Karnataka", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Chitradurga_fort2.jpg/800px-Chitradurga_fort2.jpg", description: "Stone fortress with seven concentric granite walls.", tags: ["fort", "seven-walls", "dynasties"], bestTime: "Oct-Mar", rating: 4.6 },
  { id: 34, name: "Srirangapatna", state: "Karnataka", type: "Historical", weather: ["Warm", "Hot"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ranganathaswamy_Temple%2C_Srirangapatna.jpg/800px-Ranganathaswamy_Temple%2C_Srirangapatna.jpg", description: "Tipu Sultan's island capital on Kaveri river.", tags: ["tipu-sultan", "island-fort", "colonial"], bestTime: "Oct-Mar", rating: 4.5 },
  { id: 35, name: "Dholavira", state: "Gujarat", type: "Historical", weather: ["Hot", "Warm"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Dholavira_excavation_site.jpg/800px-Dholavira_excavation_site.jpg", description: "UNESCO-listed Harappan city with ancient water system.", tags: ["UNESCO", "harappan", "water-system"], bestTime: "Oct-Feb", rating: 4.7 },
  { id: 36, name: "Bishnupur Temples", state: "West Bengal", type: "Historical", weather: ["Warm", "Mild"], budget: "₹5K-10K", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bishnupur_Ras_mancha%2C_West_Bengal.jpg/800px-Bishnupur_Ras_mancha%2C_West_Bengal.jpg", description: "17th-century Malla kingdom terracotta temples.", tags: ["terracotta", "malla-kingdom", "folk-art"], bestTime: "Oct-Mar", rating: 4.5 },
]

function getFilteredDestinations(allDestinations: Destination[], filters: { locationType: string | null; weather: string | null; state: string | null; budget: string | null }) {
  const { locationType, weather, state, budget } = filters

  let filtered = allDestinations.filter((dest) => {
    const typeMatch = !locationType || dest.type === locationType
    const weatherMatch = !weather || dest.weather.includes(weather as any)
    const stateMatch = !state || dest.state === state
    const budgetMatch = !budget || dest.budget === budget
    return typeMatch && weatherMatch && stateMatch && budgetMatch
  })

  if (filtered.length >= 5) return filtered
  filtered = allDestinations.filter((d) => {
    const tm = !locationType || d.type === locationType
    const wm = !weather || d.weather.includes(weather as any)
    const sm = !state || d.state === state
    return tm && wm && sm
  })
  if (filtered.length >= 5) return filtered
  filtered = allDestinations.filter((d) => {
    const tm = !locationType || d.type === locationType
    const wm = !weather || d.weather.includes(weather as any)
    return tm && wm
  })
  if (filtered.length >= 5) return filtered
  filtered = allDestinations.filter((d) => !locationType || d.type === locationType)
  if (filtered.length >= 5) return filtered
  return allDestinations
}

export default function ExplorePage() {
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(INDIAN_DESTINATIONS)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)

  useEffect(() => {
    const filtered = getFilteredDestinations(INDIAN_DESTINATIONS, {
      locationType: selectedType,
      weather: selectedWeather,
      state: selectedState,
      budget: selectedBudget,
    })
    setFilteredDestinations(filtered)
  }, [selectedType, selectedWeather, selectedState, selectedBudget])

  const clearFilters = () => {
    setSelectedType(null)
    setSelectedWeather(null)
    setSelectedState(null)
    setSelectedBudget(null)
  }

  const hasActiveFilters = selectedType || selectedWeather || selectedState || selectedBudget
  const activeFilters = [selectedType, selectedWeather, selectedState, selectedBudget].filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-primary/5 to-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Explore Indian Hidden Gems
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">
              Discover India's Best Kept Secrets
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore {filteredDestinations.length} of {INDIAN_DESTINATIONS.length} amazing Indian destinations with advanced filters
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-2">
              <div className="sticky top-20 bg-white dark:bg-slate-950 rounded-2xl border-2 border-primary/10 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Preferences
                </h3>
                <div className="mb-8">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Location Type</label>
                  <select value={selectedType || ""} onChange={(e) => setSelectedType(e.target.value || null)} className="w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer hover:border-primary/40">
                    <option value="">All Types</option>
                    {LOCATION_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Weather</label>
                  <select value={selectedWeather || ""} onChange={(e) => setSelectedWeather(e.target.value || null)} className="w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer hover:border-primary/40">
                    <option value="">All Weather</option>
                    {WEATHER_CONDITIONS.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              {filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDestinations.map((destination) => (
                    <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1 flex flex-col">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img src={destination.image} alt={destination.name} loading="lazy" onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg/800px-Paddy_fields_at_Ziro%2C_Arunachal_Pradesh.jpg" }} style={{ width: "100%", height: "220px", objectFit: "cover" }} className="group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Badge className="bg-background/95 backdrop-blur-sm text-foreground shadow-lg">{destination.type}</Badge>
                          <Badge className="bg-primary/95 backdrop-blur-sm text-primary-foreground shadow-lg">💰 {destination.budget}</Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors"><strong>{destination.name}</strong></CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary flex-shrink-0" />{destination.state}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3 flex-1">
                        <div className="mb-3 flex gap-1 flex-wrap">
                          {destination.weather.map((w) => (<Badge key={w} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">🌡️ {w}</Badge>))}
                        </div>
                        <div className="flex items-center gap-2 mb-3"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /><span className="text-sm font-semibold">{destination.rating}/5</span></div>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3">{destination.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3"><Calendar className="h-4 w-4" /><span>Best: {destination.bestTime}</span></div>
                        <div className="flex gap-1 flex-wrap">
                          {destination.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100 border-green-200"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link href={`/destination/${destination.id}`} className="w-full">
                          <Button className="w-full bg-[#1A6B3C] hover:bg-[#155233] text-white">View Details →</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-primary/20">
                  <Sparkles className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No destinations found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
                  <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-20 bg-white dark:bg-slate-950 rounded-2xl border-2 border-primary/10 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="text-2xl">📍</span> Refine
                </h3>
                <div className="mb-8">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">State</label>
                  <select value={selectedState || ""} onChange={(e) => setSelectedState(e.target.value || null)} className="w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer hover:border-primary/40">
                    {INDIAN_STATES.map((state) => (<option key={state} value={state === "All States" ? "" : state}>{state}</option>))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Budget</label>
                  <select value={selectedBudget || ""} onChange={(e) => setSelectedBudget(e.target.value || null)} className="w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-background text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer hover:border-primary/40">
                    <option value="">All Budgets</option>
                    {BUDGET_RANGES.map((budget) => (<option key={budget} value={budget}>{budget}</option>))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="w-full mb-6"><X className="h-4 w-4 mr-2" />Clear All</Button>
                )}
                <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Active Filters</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.length > 0 ? (
                      activeFilters.map((filter, idx) => (
                        <Badge key={idx} style={{ backgroundColor: "#E8F5EE", color: "#1A6B3C" }} className="text-xs">{filter}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDestinations.length}</span> of <span className="font-semibold text-foreground">{INDIAN_DESTINATIONS.length}</span> destinations
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
