import React from 'react'
import { render, screen } from '@testing-library/react'
import { FeatureCard } from '@/components/ui/feature-card'

const mockFeature = {
  title: 'Ocean View Rooms',
  description: 'Wake up to stunning ocean views from your private room',
  image: '/images/features/ocean-view.jpg',
  href: '/rooms',
}

describe('FeatureCard', () => {
  it('renders feature title', () => {
    render(<FeatureCard {...mockFeature} />)
    expect(screen.getByText('Ocean View Rooms')).toBeInTheDocument()
  })

  it('renders feature description', () => {
    render(<FeatureCard {...mockFeature} />)
    expect(screen.getByText('Wake up to stunning ocean views from your private room')).toBeInTheDocument()
  })

  it('renders learn more link with correct href', () => {
    render(<FeatureCard {...mockFeature} />)
    const link = screen.getByText('Learn More')
    expect(link).toHaveAttribute('href', '/rooms')
  })

  it('renders feature image with correct alt text', () => {
    render(<FeatureCard {...mockFeature} />)
    const image = screen.getByAltText('Ocean View Rooms')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/images/features/ocean-view.jpg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <FeatureCard {...mockFeature} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(<FeatureCard {...mockFeature} />)
    const card = container.querySelector('.touch-manipulation')
    expect(card).toBeInTheDocument()
  })
})
