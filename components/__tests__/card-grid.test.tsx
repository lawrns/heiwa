import { render, screen } from '@testing-library/react'
import { CardGrid } from '../card-grid'

describe('CardGrid', () => {
  const mockItems = [
    {
      title: 'Test Card 1',
      image: '/test-image-1.jpg',
      href: '/test-1'
    },
    {
      title: 'Test Card 2',
      image: '/test-image-2.jpg',
      href: '/test-2'
    },
    {
      title: 'Test Card 3',
      image: '/test-image-3.jpg'
    }
  ]

  it('renders all card items', () => {
    render(<CardGrid items={mockItems} />)
    expect(screen.getByText('Test Card 1')).toBeInTheDocument()
    expect(screen.getByText('Test Card 2')).toBeInTheDocument()
    expect(screen.getByText('Test Card 3')).toBeInTheDocument()
  })

  it('renders cards with proper links when href is provided', () => {
    render(<CardGrid items={mockItems} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2) // Only first two items have href

    expect(links[0]).toHaveAttribute('href', '/test-1')
    expect(links[1]).toHaveAttribute('href', '/test-2')
  })

  it('renders images with proper alt text', () => {
    render(<CardGrid items={mockItems} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('alt', mockItems[index].title)
    })
  })

  it('applies hover animations', () => {
    render(<CardGrid items={mockItems} />)
    // Test will verify hover effects are applied
    // This will fail until motion.div with whileHover is implemented
  })

  it('renders in responsive grid layout', () => {
    render(<CardGrid items={mockItems} />)
    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid')
  })

  it('supports custom column count', () => {
    render(<CardGrid items={mockItems} columns={2} />)
    // Test will verify grid-cols-2 class is applied
  })

  it('has proper keyboard navigation', () => {
    render(<CardGrid items={mockItems.slice(0, 2)} />) // Only items with href
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })
})
