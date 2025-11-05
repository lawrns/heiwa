import { render, screen, waitFor } from '@testing-library/react'
import SurfWeeks from '../app/surf-weeks/page'

describe('Surf Weeks Page Integration', () => {
  it('renders page title and description', () => {
    render(<SurfWeeks />)

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent(/surf weeks/i)
  })

  it('renders YouTube video embed', () => {
    render(<SurfWeeks />)

    // Initially shows poster image
    const posterImage = screen.getByAltText('Video poster')
    expect(posterImage).toBeInTheDocument()
  })

  it('loads video player on interaction', async () => {
    render(<SurfWeeks />)

    // Click on poster to load video
    const posterImage = screen.getByAltText('Video poster')
    posterImage.click()

    // Wait for ReactPlayer to load
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument()
    })
  })

  it('has proper video accessibility', () => {
    render(<SurfWeeks />)

    // Video region should have proper ARIA labels
    const videoRegion = screen.getByRole('region', { name: /surf weeks video/i })
    expect(videoRegion).toBeInTheDocument()
  })

  it('renders program information section', () => {
    render(<SurfWeeks />)

    // Should have program details section
    const programSection = screen.getByRole('region', { name: /program details/i })
    expect(programSection).toBeInTheDocument()
  })

  it('displays program features if available', () => {
    render(<SurfWeeks />)

    // Check for feature list or program content
    // May or may not have features depending on implementation
    // const features = screen.queryAllByRole('listitem') // Placeholder for future feature assertions
    expect(screen.getByText(/surf weeks|surf training|master the waves/i)).toBeInTheDocument()
  })

  it('has proper page structure and SEO', () => {
    render(<SurfWeeks />)

    // Main content area
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()

    // Page title in document
    expect(document.title).toContain('Surf Weeks')

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeInTheDocument()
  })

  it('implements lazy loading for video', () => {
    render(<SurfWeeks />)

    // Video player should not be loaded initially
    expect(screen.queryByTestId('react-player')).not.toBeInTheDocument()

    // Poster should be visible
    expect(screen.getByAltText('Video poster')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<SurfWeeks />)

    // Video controls should be keyboard accessible when loaded
    // Initially, poster should be focusable
    const posterImage = screen.getByAltText('Video poster')
    posterImage.focus()
    expect(document.activeElement).toBe(posterImage)
  })

  it('handles video loading states', async () => {
    render(<SurfWeeks />)

    const posterImage = screen.getByAltText('Video poster')
    posterImage.click()

    // Should show loading state briefly
    expect(screen.getByText('Loading video...')).toBeInTheDocument()

    // Then video player should appear
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('has responsive hero section', () => {
    render(<SurfWeeks />)

    // Hero section should be responsive
    const heroSection = screen.getByRole('heading', { name: /surf weeks/i }).closest('section')
    expect(heroSection).toHaveClass('h-[70vh]', 'min-h-[500px]')
  })

  it('includes featured surf week section', () => {
    render(<SurfWeeks />)

    // Check for featured surf week content
    expect(screen.getByText(/february 1st to 12th, 2025/i)).toBeInTheDocument()
    expect(screen.getByText(/professional surf instruction with video analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/book now/i)).toBeInTheDocument()
  })
})
