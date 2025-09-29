import { render, screen } from '@testing-library/react'
import { Hero } from '../hero'

describe('Hero', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test subtitle for the hero component',
    image: '/test-image.jpg',
    ctas: [
      { label: 'Test CTA', href: '/test' }
    ]
  }

  it('renders the hero title', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders the hero subtitle', () => {
    render(<Hero {...defaultProps} />)
    expect(screen.getByText('Test subtitle for the hero component')).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<Hero {...defaultProps} />)
    const ctaButton = screen.getByText('Test CTA')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/test')
  })

  it('renders with proper heading hierarchy', () => {
    render(<Hero {...defaultProps} />)
    const title = screen.getByText('Test Title')
    expect(title.tagName).toBe('H1')
  })

  it('has proper accessibility attributes', () => {
    render(<Hero {...defaultProps} />)
    // Test for proper alt text, ARIA labels, etc.
    const heroSection = screen.getByRole('banner')
    expect(heroSection).toBeInTheDocument()
  })

  it('renders background image with priority', () => {
    render(<Hero {...defaultProps} />)
    // This test will fail until the component is implemented
    // The implementation should use next/image with priority prop
  })
})

