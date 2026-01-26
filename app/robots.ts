import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://heiwahouse.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test-rooms/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

