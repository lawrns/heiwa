/**
 * Structured Data (JSON-LD) helpers for SEO
 */

export interface Organization {
  name: string
  url: string
  logo: string
  contactPoint?: {
    telephone: string
    contactType: string
    email?: string
  }
  sameAs?: string[]
}

export interface LocalBusiness extends Organization {
  '@type': 'Lodging' | 'Hotel' | 'Resort'
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  priceRange?: string
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
  }
}

export function generateOrganizationSchema(data: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    contactPoint: data.contactPoint,
    sameAs: data.sameAs,
  }
}

export function generateLocalBusinessSchema(data: LocalBusiness) {
  return {
    '@context': 'https://schema.org',
    '@type': data['@type'],
    name: data.name,
    url: data.url,
    logo: data.logo,
    address: data.address,
    geo: data.geo,
    priceRange: data.priceRange,
    aggregateRating: data.aggregateRating,
    contactPoint: data.contactPoint,
    sameAs: data.sameAs,
  }
}

export function generateAccommodationSchema(room: {
  name: string
  description: string
  image: string[]
  pricePerNight: number
  amenities: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: room.name,
    description: room.description,
    image: room.image,
    offers: {
      '@type': 'Offer',
      price: room.pricePerNight,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    amenityFeature: room.amenities.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    })),
  }
}

export function generateEventSchema(surfCamp: {
  name: string
  description: string
  startDate: string
  endDate: string
  price: number
  location: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: surfCamp.name,
    description: surfCamp.description,
    startDate: surfCamp.startDate,
    endDate: surfCamp.endDate,
    location: {
      '@type': 'Place',
      name: surfCamp.location,
    },
    offers: {
      '@type': 'Offer',
      price: surfCamp.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }
}

export function generateBreadcrumbSchema(items: Array<{name: string; url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Default Heiwa House data
export const heiwaHouseData: LocalBusiness = {
  '@type': 'Lodging',
  name: 'Heiwa House',
  url: 'https://heiwahouse.com',
  logo: 'https://heiwahouse.com/images/heiwalogo.webp',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Santa Cruz',
    addressLocality: 'Santa Cruz',
    addressRegion: 'Lisbon',
    postalCode: '2560',
    addressCountry: 'PT',
  },
  priceRange: '€€',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.8,
    reviewCount: 127,
  },
  contactPoint: {
    telephone: '+351-912-193-785',
    contactType: 'Customer Service',
    email: 'info@heiwahouse.com',
  },
  sameAs: [
    'https://www.instagram.com/heiwahouse',
    'https://www.facebook.com/heiwahouse',
  ],
}

