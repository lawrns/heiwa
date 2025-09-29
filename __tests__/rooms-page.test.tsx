import { render, screen } from '@testing-library/react'
import Rooms from '../app/rooms/page'

describe('Rooms Page Integration', () => {
  it('renders page title', () => {
    render(<Rooms />)

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toBeInTheDocument()
  })

  it('renders 3-column grid layout', () => {
    render(<Rooms />)

    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('renders all four room cards', () => {
    render(<Rooms />)

    expect(screen.getByText('Room Nr 1')).toBeInTheDocument()
    expect(screen.getByText('Room Nr 2')).toBeInTheDocument()
    expect(screen.getByText('Room Nr 3')).toBeInTheDocument()
    expect(screen.getByText('Dorm room')).toBeInTheDocument()
  })

  it('displays room images with proper optimization', () => {
    render(<Rooms />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(4)

    // All images should be from heiwahouse.com domain
    images.forEach(img => {
      const src = img.getAttribute('src')
      expect(src).toContain('heiwahouse.com')
      // Should use next/image optimization
      expect(img).toHaveAttribute('data-nimg')
    })
  })

  it('renders booking CTA button', () => {
    render(<Rooms />)

    const ctaButton = screen.getByText('Check Availability')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/rooms#booking')
  })

  it('has proper page structure and accessibility', () => {
    render(<Rooms />)

    // Main content area
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Proper heading hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)

    // Images have alt text
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('alt')
    })
  })

  it('renders responsive grid on different screen sizes', () => {
    render(<Rooms />)

    const grid = screen.getByRole('grid')

    // Base responsive classes should be present
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('gap-6') // Should match design tokens
  })

  it('supports keyboard navigation', () => {
    render(<Rooms />)

    // CTA button should be keyboard accessible
    const ctaButton = screen.getByText('Check Availability')
    expect(ctaButton).toBeInTheDocument()

    // Should be focusable
    ctaButton.focus()
    expect(document.activeElement).toBe(ctaButton)
  })

  it('loads images without layout shift', () => {
    render(<Rooms />)

    // Images should have width and height to prevent CLS
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('width')
      expect(img).toHaveAttribute('height')
    })
  })
})

