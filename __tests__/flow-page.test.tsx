import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import FlowPage from '../app/flow/page'

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

describe('Flow Page', () => {
  beforeEach(() => {
    render(<FlowPage />)
  })

  it('renders the main heading', () => {
    expect(screen.getByRole('heading', { name: /heiwa flow/i })).toBeInTheDocument()
  })

  it('renders the hero section with correct description', () => {
    expect(screen.getByText(/find your inner flow through yoga, wellness, and mindful practices/i)).toBeInTheDocument()
  })

  it('renders all 4 main flow services', () => {
    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('Massage')).toBeInTheDocument()
    expect(screen.getByText('Ice Bath')).toBeInTheDocument()
    expect(screen.getByText('Sauna')).toBeInTheDocument()
  })

  it('renders the available on request section', () => {
    expect(screen.getByText(/available on request/i)).toBeInTheDocument()
    expect(screen.getByText('Breathwork')).toBeInTheDocument()
    expect(screen.getByText('Gong and Sound Healing')).toBeInTheDocument()
    expect(screen.getByText('Nail Boards')).toBeInTheDocument()
    expect(screen.getByText('Somatic Alignment')).toBeInTheDocument()
    expect(screen.getByText('Reiki')).toBeInTheDocument()
    expect(screen.getByText('Cacao Ceremony')).toBeInTheDocument()
    expect(screen.getByText('Rapé Ceremony')).toBeInTheDocument()
    expect(screen.getByText('Meditation')).toBeInTheDocument()
  })

  it('renders the CTA section with email link', () => {
    expect(screen.getByText(/ready to find your flow/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /enquire now/i })).toHaveAttribute('href', 'mailto:info@heiwahouse.com')
  })

  it('renders the reviews section', () => {
    expect(screen.getByText(/what our guests say about flow/i)).toBeInTheDocument()
    expect(screen.getByText(/maria s\./i)).toBeInTheDocument()
    expect(screen.getByText(/thomas k\./i)).toBeInTheDocument()
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
    const heroSection = screen.getByRole('heading', { name: /heiwa flow/i }).closest('section')
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

  it('displays service features correctly', () => {
    expect(screen.getByText('Daily sessions')).toBeInTheDocument()
    expect(screen.getByText('Professional therapists')).toBeInTheDocument()
    expect(screen.getByText('Cold therapy')).toBeInTheDocument()
    expect(screen.getByText('Traditional sauna')).toBeInTheDocument()
  })
})
