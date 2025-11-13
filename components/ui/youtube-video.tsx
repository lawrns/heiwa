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
  const embedUrl = `https://www.youtube.com/embed/${cleanVideoId}?controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0`

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  )
}
