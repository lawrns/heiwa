'use client'

interface VideoPlayerProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: VideoPlayerProps) {
  // Extract video ID from URL if full URL is provided
  const extractVideoId = (idOrUrl: string): string => {
    if (idOrUrl.includes('youtu.be/')) {
      return idOrUrl.split('youtu.be/')[1]?.split('?')[0] || idOrUrl
    }
    if (idOrUrl.includes('youtube.com/watch?v=')) {
      return idOrUrl.split('v=')[1]?.split('&')[0] || idOrUrl
    }
    return idOrUrl
  }

  const cleanVideoId = extractVideoId(videoId)
  // Minimal controls format
  const embedUrl = `https://www.youtube.com/embed/${cleanVideoId}?controls=0&modestbranding=1&rel=0`

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}>
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
