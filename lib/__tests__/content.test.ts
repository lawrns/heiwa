// Unit tests for content data validation

// Mock the supabase module to prevent environment variable errors
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}))

import { navigationItems, rooms, experiences, homePageContent } from '../content'

describe('Navigation Items', () => {
  it('has required navigation items', () => {
    expect(navigationItems.length).toBeGreaterThanOrEqual(4)
    // Check that essential navigation items exist
    const navNames = navigationItems.map(item => item.name.toUpperCase())
    expect(navNames).toContain('HOME')
    expect(navNames).toContain('ROOM RENTALS')
  })

  it('all navigation items have valid paths', () => {
    navigationItems.forEach(item => {
      expect(item.path).toMatch(/^\/[a-z-]*$/)
    })
  })
})

describe('Rooms Data', () => {
  it('has correct number of rooms', () => {
    expect(rooms).toHaveLength(4)
  })

  it('all rooms have required properties', () => {
    rooms.forEach(room => {
      expect(room.id).toBeDefined()
      expect(room.name).toBeDefined()
      expect(room.image).toBeDefined()
      expect(typeof room.id).toBe('string')
      expect(typeof room.name).toBe('string')
      expect(typeof room.image).toBe('string')
    })
  })

  it('room images are valid paths', () => {
    rooms.forEach(room => {
      // Images can be local paths or external URLs
      expect(room.image).toMatch(/^(\/images\/|https?:\/\/)/)
    })
  })

  it('room IDs are unique', () => {
    const ids = rooms.map(room => room.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('Experiences Data', () => {
  it('has correct number of experiences', () => {
    expect(experiences).toHaveLength(8)
  })

  it('all experiences have required properties', () => {
    experiences.forEach(experience => {
      expect(experience.id).toBeDefined()
      expect(experience.title).toBeDefined()
      expect(experience.image).toBeDefined()
      expect(typeof experience.id).toBe('string')
      expect(typeof experience.title).toBe('string')
      expect(typeof experience.image).toBe('string')
    })
  })

  it('experience images are valid paths', () => {
    experiences.forEach(experience => {
      // Images can be local paths or external URLs
      expect(experience.image).toMatch(/^(\/images\/|https?:\/\/)/)
    })
  })

  it('experience IDs are unique', () => {
    const ids = experiences.map(experience => experience.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('Home Page Content', () => {
  it('has hero section with required properties', () => {
    expect(homePageContent.hero.title).toBeDefined()
    expect(homePageContent.hero.subtitle).toBeDefined()
    expect(homePageContent.hero.backgroundImage).toBeDefined()
    expect(homePageContent.hero.cta).toBeDefined()
    expect(Array.isArray(homePageContent.hero.cta)).toBe(true)
  })

  it('has feature cards', () => {
    expect(Array.isArray(homePageContent.featureCards)).toBe(true)
    expect(homePageContent.featureCards).toHaveLength(3)

    homePageContent.featureCards.forEach(card => {
      expect(card.title).toBeDefined()
      expect(card.image).toBeDefined()
      expect(card.href).toBeDefined()
    })
  })

  it('has video embed configuration', () => {
    expect(homePageContent.videoEmbed.provider).toBeDefined()
    expect(homePageContent.videoEmbed.src).toBeDefined()
    expect(homePageContent.videoEmbed.poster).toBeDefined()
  })
})

