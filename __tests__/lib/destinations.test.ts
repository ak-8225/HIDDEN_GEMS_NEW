import { getDestinations, addDestination, getDestinationById, type Destination } from '@/lib/destinations'

describe('Destinations Library', () => {
  // Reset localStorage before each test
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('getDestinations', () => {
    it('should return default destinations if localStorage is empty', () => {
      const destinations = getDestinations()
      expect(destinations).toHaveLength(6)
      expect(destinations[0].name).toBe('Sapa Rice Terraces')
    })

    it('should return destinations from localStorage if available', () => {
      const mockDestinations = [
        {
          id: 1,
          name: 'Test Destination',
          location: 'Test Location',
          category: 'Nature',
          description: 'Test Description',
          image: '/test.jpg',
        },
      ]
      localStorage.setItem('destinations', JSON.stringify(mockDestinations))

      const destinations = getDestinations()
      expect(destinations).toEqual(mockDestinations)
    })
  })

  describe('addDestination', () => {
    it('should add a new destination with correct properties', () => {
      const newDestination = {
        name: 'New Gem',
        location: 'Somewhere',
        category: 'Adventure',
        description: 'A new adventure destination',
        image: '/new.jpg',
      }

      const result = addDestination(newDestination)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('createdAt')
      expect(result.name).toBe('New Gem')
      expect(result.location).toBe('Somewhere')
    })

    it('should assign unique IDs to new destinations', () => {
      const dest1 = addDestination({
        name: 'Destination 1',
        location: 'Location 1',
        category: 'Nature',
        description: 'Desc 1',
        image: '/1.jpg',
      })

      const dest2 = addDestination({
        name: 'Destination 2',
        location: 'Location 2',
        category: 'Culture',
        description: 'Desc 2',
        image: '/2.jpg',
      })

      expect(dest2.id).toBeGreaterThan(dest1.id)
    })

    it('should persist data to localStorage', () => {
      addDestination({
        name: 'Test',
        location: 'Test',
        category: 'Test',
        description: 'Test',
        image: '/test.jpg',
      })

      const stored = localStorage.getItem('destinations')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(Array.isArray(parsed)).toBe(true)
    })
  })

  describe('getDestinationById', () => {
    it('should return the correct destination by ID', () => {
      const destinations = getDestinations()
      const firstDest = destinations[0]

      const found = getDestinationById(firstDest.id)
      expect(found).toEqual(firstDest)
    })

    it('should return undefined for non-existent ID', () => {
      const found = getDestinationById(9999)
      expect(found).toBeUndefined()
    })
  })
})
