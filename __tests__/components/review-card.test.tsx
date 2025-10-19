import React from 'react'
import { render, screen } from '@testing-library/react'
import { ReviewCard, GoogleReviews } from '@/components/ui/review-card'

const mockReview = {
  id: '1',
  name: 'John Doe',
  rating: 5,
  text: 'Amazing experience at Heiwa House! The surf lessons were incredible.',
  timeAgo: '2 weeks ago',
  verified: true,
}

const mockReviews = [
  mockReview,
  {
    id: '2',
    name: 'Jane Smith',
    rating: 4,
    text: 'Great place to stay, very friendly staff.',
    timeAgo: '1 month ago',
    verified: false,
  },
]

const mockGoogleReviews = {
  reviews: mockReviews,
  rating: 4.8,
  reviewCount: 127,
  onReviewUs: jest.fn(),
}

describe('ReviewCard', () => {
  it('renders reviewer name', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders review text', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText('Amazing experience at Heiwa House! The surf lessons were incredible.')).toBeInTheDocument()
  })

  it('renders time ago', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText('2 weeks ago')).toBeInTheDocument()
  })

  it('renders verified badge for verified reviews', () => {
    render(<ReviewCard review={mockReview} />)
    expect(screen.getByText('G')).toBeInTheDocument() // Google icon
  })

  it('renders correct number of stars', () => {
    render(<ReviewCard review={mockReview} />)
    const stars = screen.getAllByTestId('star')
    expect(stars).toHaveLength(5)
  })

  it('applies custom className', () => {
    const { container } = render(
      <ReviewCard review={mockReview} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('GoogleReviews', () => {
  it('renders overall rating', () => {
    render(<GoogleReviews {...mockGoogleReviews} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('renders review count', () => {
    render(<GoogleReviews {...mockGoogleReviews} />)
    expect(screen.getByText('(127)')).toBeInTheDocument()
  })

  it('renders review us button', () => {
    render(<GoogleReviews {...mockGoogleReviews} />)
    expect(screen.getByText('Review us on Google')).toBeInTheDocument()
  })

  it('calls onReviewUs when button is clicked', () => {
    render(<GoogleReviews {...mockGoogleReviews} />)
    const button = screen.getByText('Review us on Google')
    button.click()
    expect(mockGoogleReviews.onReviewUs).toHaveBeenCalledTimes(1)
  })

  it('renders all individual reviews', () => {
    render(<GoogleReviews {...mockGoogleReviews} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })
})

