import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://heiwahouse.com'
  
  // Static pages
  const staticPages = [
    '',
    '/rooms',
    '/surf-weeks',
    '/surf',
    '/the-spot',
    '/booking',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Fetch dynamic room pages from database
  // const rooms = await getRooms()
  // const roomPages = rooms.map((room) => ({
  //   url: `${baseUrl}/rooms/${room.id}`,
  //   lastModified: new Date(room.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }))

  return [...staticPages]
}

