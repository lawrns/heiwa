import { render, screen, waitFor } from '@testing-library/react'
import { VideoEmbed } from '../video-embed'

describe('VideoEmbed', () => {
  const defaultProps = {
    src: 'https://youtu.be/test-video',
    provider: 'youtube' as const,
    poster: '/test-poster.jpg'
  }

  it('renders poster image initially', () => {
    render(<VideoEmbed {...defaultProps} />)
    const posterImage = screen.getByAltText('Video poster')
    expect(posterImage).toBeInTheDocument()
    expect(posterImage).toHaveAttribute('src', '/test-poster.jpg')
  })

  it('does not load video player immediately', () => {
    render(<VideoEmbed {...defaultProps} />)
    // ReactPlayer should not be rendered initially
    expect(screen.queryByTestId('react-player')).not.toBeInTheDocument()
  })

  it('loads video player on user interaction', async () => {
    render(<VideoEmbed {...defaultProps} />)

    // Simulate user interaction (click on poster)
    const posterImage = screen.getByAltText('Video poster')
    posterImage.click()

    // Wait for video player to load
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument()
    })
  })

  it('supports YouTube provider', () => {
    render(<VideoEmbed {...defaultProps} />)
    // Test will verify YouTube URL handling
  })

  it('supports Vimeo provider', () => {
    render(<VideoEmbed src="https://vimeo.com/test" provider="vimeo" />)
    // Test will verify Vimeo URL handling
  })

  it('has proper accessibility attributes', () => {
    render(<VideoEmbed {...defaultProps} />)
    const container = screen.getByRole('region', { name: /video/i })
    expect(container).toBeInTheDocument()
  })

  it('implements lazy loading with Intersection Observer', () => {
    render(<VideoEmbed {...defaultProps} />)
    // Test will verify intersection observer setup
    // This will require mocking IntersectionObserver
  })

  it('handles loading states properly', async () => {
    render(<VideoEmbed {...defaultProps} />)

    // Initially shows poster
    expect(screen.getByAltText('Video poster')).toBeInTheDocument()

    // After interaction, shows loading state briefly
    const posterImage = screen.getByAltText('Video poster')
    posterImage.click()

    // Loading state should be shown
    expect(screen.getByText('Loading video...')).toBeInTheDocument()

    // Then video player appears
    await waitFor(() => {
      expect(screen.getByTestId('react-player')).toBeInTheDocument()
    })
  })
})
