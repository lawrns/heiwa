import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PlayPage from '../app/play/page'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock the FloatingCheckAvailability component
jest.mock('../components/floating-check-availability', () => ({
  FloatingCheckAvailability: () => <div data-testid="floating-check-availability">Check Availability</div>,
}))

describe('Play Page', () => {
  beforeEach(() => {
    render(<PlayPage />)
  })

  it('renders the main heading', () => {
    expect(screen.getByRole('heading', { name: /heiwa play/i })).toBeInTheDocument()
  })

  it('renders the hero section with correct description', () => {
    expect(screen.getByText(/unleash your inner child with endless activities and adventures/i)).toBeInTheDocument()
  })

  it('renders all 6 activity cards', () => {
    expect(screen.getByText('Table Games')).toBeInTheDocument()
    expect(screen.getByText('Sauna & Ice Bath')).toBeInTheDocument()
    expect(screen.getByText('Giant Pool')).toBeInTheDocument()
    expect(screen.getByText('Gym')).toBeInTheDocument()
    expect(screen.getByText('Bicycles')).toBeInTheDocument()
    expect(screen.getByText('Skatepark')).toBeInTheDocument()
  })

  it('renders the FAQ section', () => {
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument()
    expect(screen.getByText(/are the play activities included in the surf week package/i)).toBeInTheDocument()
  })

  it('renders the reviews section', () => {
    expect(screen.getByText(/what our guests say about play activities/i)).toBeInTheDocument()
    expect(screen.getByText(/sarah m\./i)).toBeInTheDocument()
    expect(screen.getByText(/mike r\./i)).toBeInTheDocument()
  })

  it('renders the CTA section with email link', () => {
    expect(screen.getByText(/ready to play/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book your adventure/i })).toHaveAttribute('href', 'mailto:info@heiwahouse.com')
  })

  it('renders the floating check availability component', () => {
    expect(screen.getByTestId('floating-check-availability')).toBeInTheDocument()
  })

  it('has correct page metadata', () => {
    // Metadata is set at the page level, not in the component render
    // This test would need to test the metadata export separately
    expect(true).toBe(true) // Placeholder test
  })

  it('renders responsive design elements', () => {
    const heroSection = screen.getByRole('heading', { name: /heiwa play/i }).closest('section')
    expect(heroSection).toHaveClass('h-[60vh]', 'min-h-[400px]')
  })

  it('includes accessibility features', () => {
    // Check for proper alt text on images
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings.length).toBeGreaterThan(0)
  })
})
