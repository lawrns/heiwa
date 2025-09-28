import { render, screen } from '@testing-library/react'
import TheSpot from '../app/the-spot/page'

describe('Experiences Page Integration', () => {
  it('renders page title and introduction', () => {
    render(<TheSpot />)

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toBeInTheDocument()
  })

  it('renders all eight experience cards', () => {
    render(<TheSpot />)

    const experiences = [
      'Hiking',
      'Horseback Riding',
      'Sauna',
      'Surfing',
      'Skatepark',
      'Yoga',
      'Bicycle Ride',
      'Day Trips'
    ]

    experiences.forEach(experience => {
      expect(screen.getByText(experience)).toBeInTheDocument()
    })
  })

  it('displays experience images with proper optimization', () => {
    render(<TheSpot />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(8)

    // All images should be from heiwahouse.com domain
    images.forEach(img => {
      const src = img.getAttribute('src')
      expect(src).toContain('heiwahouse.com')
      // Should use next/image optimization
      expect(img).toHaveAttribute('data-nimg')
    })
  })

  it('renders cards in responsive grid layout', () => {
    render(<TheSpot />)

    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')
  })

  it('has proper page structure and accessibility', () => {
    render(<TheSpot />)

    // Main content area
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Proper heading hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)

    // Images have descriptive alt text
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('alt')
      expect(img.getAttribute('alt')).not.toBe('')
    })
  })

  it('supports keyboard navigation through cards', () => {
    render(<TheSpot />)

    // All cards should be keyboard accessible
    const cards = screen.getAllByRole('article')
    expect(cards.length).toBe(8)

    // Each card should be focusable or contain focusable elements
    cards.forEach(card => {
      const links = card.querySelectorAll('a')
      const buttons = card.querySelectorAll('button')
      expect(links.length + buttons.length).toBeGreaterThan(0)
    })
  })

  it('implements hover animations on cards', () => {
    render(<TheSpot />)

    // Cards should have hover effects
    const cards = screen.getAllByRole('article')
    cards.forEach(card => {
      // Check for motion.div or hover classes
      expect(card).toHaveClass('transition-transform', 'hover:scale-105')
    })
  })

  it('loads images with consistent aspect ratios', () => {
    render(<TheSpot />)

    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('width')
      expect(img).toHaveAttribute('height')
      // Should maintain consistent aspect ratio
      const width = parseInt(img.getAttribute('width') || '0')
      const height = parseInt(img.getAttribute('height') || '0')
      expect(width / height).toBeCloseTo(1.5, 1) // Roughly 3:2 aspect ratio
    })
  })

  it('has proper SEO metadata', () => {
    render(<TheSpot />)

    // Check for page-specific title
    expect(document.title).toContain('The Spot')

    // Check for meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeInTheDocument()
  })
})
