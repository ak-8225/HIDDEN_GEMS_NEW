import {
  BUDGET_RANGES,
  LOCATION_TYPES,
  WEATHER_CONDITIONS,
  addDestination,
  getAllDestinations,
  getDefaultDestinations,
  getDestinationById,
  getUserDestinations,
} from "@/lib/destinations"

describe("Destinations library", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe("getDefaultDestinations", () => {
    it("returns the curated catalogue", () => {
      const all = getDefaultDestinations()
      expect(all.length).toBeGreaterThanOrEqual(30)
      expect(all[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          state: expect.any(String),
          type: expect.stringMatching(/Adventurous|Calm|Cultural|Spiritual|Beach|Historical/),
          rating: expect.any(Number),
        }),
      )
    })

    it("uses only known LocationTypes", () => {
      const all = getDefaultDestinations()
      for (const d of all) {
        expect(LOCATION_TYPES).toContain(d.type)
      }
    })

    it("uses only known weather and budget tokens", () => {
      const all = getDefaultDestinations()
      for (const d of all) {
        expect(BUDGET_RANGES).toContain(d.budget)
        for (const w of d.weather) {
          expect(WEATHER_CONDITIONS).toContain(w)
        }
      }
    })
  })

  describe("getUserDestinations", () => {
    it("returns an empty array when localStorage is empty", () => {
      expect(getUserDestinations()).toEqual([])
    })

    it("returns user destinations from localStorage when present", () => {
      const created = addDestination({
        name: "Test Gem",
        state: "Goa",
        type: "Beach",
        weather: ["Warm"],
        budget: "₹5K-10K",
        bestTime: "Nov-Mar",
        description: "A small calm beach worth visiting once.",
        tags: ["calm", "sunset"],
        rating: 4.6,
        image: "/placeholder.jpg",
      })
      expect(getUserDestinations()).toEqual([
        expect.objectContaining({ id: created.id, name: "Test Gem" }),
      ])
    })
  })

  describe("addDestination", () => {
    it("assigns a unique id higher than the existing maximum", () => {
      const beforeMax = Math.max(...getDefaultDestinations().map((d) => d.id))
      const created = addDestination({
        name: "Unique 1",
        state: "Kerala",
        type: "Calm",
        weather: ["Warm"],
        budget: "₹5K-10K",
        bestTime: "Nov-Mar",
        description: "A description that meets the minimum length easily.",
        tags: ["a"],
        rating: 4,
        image: "/placeholder.jpg",
      })
      expect(created.id).toBeGreaterThan(beforeMax)
      expect(created.createdAt).toEqual(expect.any(String))
    })

    it("persists multiple additions without losing previous entries", () => {
      const a = addDestination({
        name: "Alpha",
        state: "Goa",
        type: "Beach",
        weather: ["Hot"],
        budget: "₹5K-10K",
        bestTime: "Oct-Mar",
        description: "Alpha description that is long enough.",
        tags: [],
        rating: 4,
        image: "/p.jpg",
      })
      const b = addDestination({
        name: "Beta",
        state: "Kerala",
        type: "Calm",
        weather: ["Warm"],
        budget: "₹8K-15K",
        bestTime: "Oct-Mar",
        description: "Beta description that is long enough.",
        tags: [],
        rating: 4.2,
        image: "/p.jpg",
      })

      const stored = getUserDestinations()
      expect(stored.map((d) => d.name).sort()).toEqual(["Alpha", "Beta"])
      expect(b.id).not.toBe(a.id)
    })
  })

  describe("getAllDestinations + getDestinationById", () => {
    it("merges user-added with defaults", () => {
      const created = addDestination({
        name: "Merged",
        state: "Goa",
        type: "Beach",
        weather: ["Warm"],
        budget: "₹5K-10K",
        bestTime: "Oct-Mar",
        description: "Merged description that is long enough.",
        tags: [],
        rating: 4.3,
        image: "/p.jpg",
      })
      const all = getAllDestinations()
      expect(all.find((d) => d.id === created.id)).toBeTruthy()
      expect(all.length).toBe(getDefaultDestinations().length + 1)
    })

    it("returns the correct destination by id", () => {
      const sample = getDefaultDestinations()[0]
      expect(getDestinationById(sample.id)).toEqual(sample)
    })

    it("returns undefined for an unknown id", () => {
      expect(getDestinationById(99999)).toBeUndefined()
    })
  })
})
