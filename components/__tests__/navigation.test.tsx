import { render, screen } from '@testing-library/react'
import { Navigation } from '../navigation'

describe('Navigation', () => {
  const mockItems = [
    { path: '/', name: 'Home' },
    { path: '/the-spot', name: 'The Spot' },
    { path: '/rooms', name: 'Room Rentals' },
    { path: '/surf-weeks', name: 'Surf Weeks' }
  ]

  it('renders all navigation items', () => {
    render(<Navigation items={mockItems} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('The Spot')).toBeInTheDocument()
    expect(screen.getByText('Room Rentals')).toBeInTheDocument()
    expect(screen.getByText('Surf Weeks')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<Navigation items={mockItems} />)
    const homeLink = screen.getByText('Home').closest('a')
    const spotLink = screen.getByText('The Spot').closest('a')
    const roomsLink = screen.getByText('Room Rentals').closest('a')
    const surfLink = screen.getByText('Surf Weeks').closest('a')

    expect(homeLink).toHaveAttribute('href', '/')
    expect(spotLink).toHaveAttribute('href', '/the-spot')
    expect(roomsLink).toHaveAttribute('href', '/rooms')
    expect(surfLink).toHaveAttribute('href', '/surf-weeks')
  })

  it('highlights current page', () => {
    render(<Navigation items={mockItems} currentPath="/rooms" />)
    const roomsLink = screen.getByText('Room Rentals').closest('a')
    expect(roomsLink).toHaveClass('current')
  })

  it('has proper navigation landmark', () => {
    render(<Navigation items={mockItems} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<Navigation items={mockItems} />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('renders mobile menu button', () => {
    render(<Navigation items={mockItems} />)
    const menuButton = screen.getByLabelText(/menu/i)
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu on button click', () => {
    render(<Navigation items={mockItems} />)
    const menuButton = screen.getByLabelText(/menu/i)

    // Initially menu is hidden
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

    // Click menu button
    menuButton.click()

    // Menu should be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('supports external links', () => {
    const itemsWithExternal = [
      ...mockItems,
      { path: 'https://example.com', name: 'External', external: true }
    ]

    render(<Navigation items={itemsWithExternal} />)
    const externalLink = screen.getByText('External').closest('a')
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
