import React from 'react'
import { render, screen } from '@testing-library/react'
import { ActivityCard } from '@/components/ui/activity-card'

const mockActivity = {
  id: '1',
  title: 'Surf Lesson',
  description: 'Learn to surf with our professional instructors',
  image: '/images/activities/surf-lesson.jpg',
  category: 'surf',
  duration: '2 hours',
  difficulty: 'beginner',
  price: 50,
}

describe('ActivityCard', () => {
  it('renders activity title', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Surf Lesson')).toBeInTheDocument()
  })

  it('renders activity image with correct alt text', () => {
    render(<ActivityCard activity={mockActivity} />)
    const image = screen.getByAltText('Surf Lesson')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/images/activities/surf-lesson.jpg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ActivityCard activity={mockActivity} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(<ActivityCard activity={mockActivity} />)
    const card = container.querySelector('.touch-manipulation')
    expect(card).toBeInTheDocument()
  })

  it('handles missing activity data gracefully', () => {
    const emptyActivity = {
      id: '',
      title: '',
      description: '',
      image: '/placeholder.jpg',
      category: 'surf',
      duration: '',
      difficulty: 'beginner',
      price: 0,
    }
    expect(() => render(<ActivityCard activity={emptyActivity} />)).not.toThrow()
  })
})
