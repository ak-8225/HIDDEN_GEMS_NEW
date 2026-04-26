export interface Destination {
  id: number
  name: string
  location: string
  category: string
  description: string
  image: string
  addedBy?: string
  createdAt?: string
}

const defaultDestinations: Destination[] = [
  {
    id: 1,
    name: "Sapa Rice Terraces",
    location: "Lào Cai, Vietnam",
    category: "Nature",
    description:
      "Stunning rice terraces carved into mountainsides, offering breathtaking views and authentic hill tribe culture.",
    image: "/vietnam-rice-terraces-landscape.jpg",
  },
  {
    id: 2,
    name: "Chefchaouen Blue City",
    location: "Chefchaouen, Morocco",
    category: "Culture",
    description: "A picturesque mountain town painted entirely in shades of blue, creating a dreamlike atmosphere.",
    image: "/blue-city-morocco-streets.jpg",
  },
  {
    id: 3,
    name: "Plitvice Lakes",
    location: "Croatia",
    category: "Nature",
    description: "A series of cascading turquoise lakes connected by stunning waterfalls in pristine wilderness.",
    image: "/plitvice-lakes-waterfalls-croatia.jpg",
  },
  {
    id: 4,
    name: "Meteora Monasteries",
    location: "Kalabaka, Greece",
    category: "Culture",
    description:
      "Ancient monasteries perched atop towering rock formations, offering spiritual peace and panoramic views.",
    image: "/meteora-monasteries-greece-rocks.jpg",
  },
  {
    id: 5,
    name: "Faroe Islands",
    location: "Denmark",
    category: "Adventure",
    description:
      "Dramatic cliffs, cascading waterfalls, and colorful villages in one of Europe's most remote locations.",
    image: "/faroe-islands-cliffs-village.jpg",
  },
  {
    id: 6,
    name: "Cappadocia",
    location: "Turkey",
    category: "Adventure",
    description: "Unique rock formations and cave dwellings with hot air balloon rides over fairy chimneys.",
    image: "/cappadocia-hot-air-balloons-turkey.jpg",
  },
]

export function getDestinations(): Destination[] {
  if (typeof window === "undefined") return defaultDestinations

  const stored = localStorage.getItem("destinations")
  if (!stored) {
    localStorage.setItem("destinations", JSON.stringify(defaultDestinations))
    return defaultDestinations
  }
  return JSON.parse(stored)
}

export function addDestination(destination: Omit<Destination, "id" | "createdAt">): Destination {
  const destinations = getDestinations()
  const newDestination: Destination = {
    ...destination,
    id: Math.max(...destinations.map((d) => d.id), 0) + 1,
    createdAt: new Date().toISOString(),
  }
  destinations.unshift(newDestination)
  localStorage.setItem("destinations", JSON.stringify(destinations))
  return newDestination
}

export function getDestinationById(id: number): Destination | undefined {
  const destinations = getDestinations()
  return destinations.find((d) => d.id === id)
}
