import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Homepage Integration', () => {
  it('renders hero section with correct content', () => {
    render(<Home />)

    // Check hero title
    expect(screen.getByText('A Wave Away')).toBeInTheDocument()

    // Check hero subtitle
    expect(screen.getByText(/Nestled on Portugal's coast/)).toBeInTheDocument()

    // Check CTA button
    const ctaButton = screen.getByText('Book Now')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/rooms')
  })

  it('renders three feature cards', () => {
    render(<Home />)

    expect(screen.getByText('Heiwa Play')).toBeInTheDocument()
    expect(screen.getByText('Heiwa Surf')).toBeInTheDocument()
    expect(screen.getByText('Heiwa Flow')).toBeInTheDocument()
  })

  it('renders video embed section', () => {
    render(<Home />)

    // Should show video poster initially
    const videoPoster = screen.getByAltText('Video poster')
    expect(videoPoster).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<Home />)

    // Should have main landmark
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Should have proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('A Wave Away')

    const h2s = screen.getAllByRole('heading', { level: 2 })
    expect(h2s.length).toBeGreaterThan(0)
  })

  it('loads all images with proper optimization', () => {
    render(<Home />)

    // All images should use next/image (check by data attributes or specific props)
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      // This will fail until proper next/image implementation
      expect(img).toHaveAttribute('data-nimg')
    })
  })

  it('has proper SEO metadata', () => {
    render(<Home />)

    // Check for title in document
    expect(document.title).toContain('Heiwa House')

    // Check for meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeInTheDocument()
  })

  it('is keyboard accessible', () => {
    render(<Home />)

    // All interactive elements should be keyboard accessible
    const links = screen.getAllByRole('link')
    const buttons = screen.getAllByRole('button')

    expect(links.length).toBeGreaterThan(0)
    expect(buttons.length).toBeGreaterThan(0)

    // Each link should have href
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('renders responsive layout', () => {
    render(<Home />)

    // Check for responsive classes on hero section
    const heroSection = screen.getByRole('heading', { name: /welcome to heiwa house/i }).closest('section')
    expect(heroSection).toHaveClass('h-screen', 'w-full')
  })
})

