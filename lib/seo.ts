/**
 * SEO Utilities for structured data and meta tags
 */

export interface SchemaMarkup {
  '@context': string
  '@type': string
  [key: string]: any
}

/**
 * Generate Organization schema markup
 */
export function generateOrganizationSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Heiwa House',
    url: 'https://heiwahouse.com',
    logo: 'https://heiwahouse.com/images/heiwalogo.webp',
    description: 'Surf camp and lifestyle destination in Santa Cruz, Portugal',
    sameAs: [
      'https://www.facebook.com/heiwahouse',
      'https://www.instagram.com/heiwahouse',
      'https://www.youtube.com/@heiwahouse',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+351-912-193-785',
      email: 'info@heiwahouse.com',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Santa Cruz',
      addressLocality: 'Santa Cruz',
      addressCountry: 'PT',
    },
  }
}

/**
 * Generate Activity schema markup
 */
export function generateActivitySchema(activity: {
  title: string
  description: string
  image: string
  url: string
  price?: string
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: activity.title,
    description: activity.description,
    image: activity.image,
    url: activity.url,
    ...(activity.price && {
      offers: {
        '@type': 'Offer',
        price: activity.price,
        priceCurrency: 'EUR',
      },
    }),
  }
}

/**
 * Generate Review schema markup
 */
export function generateReviewSchema(review: {
  author: string
  rating: number
  text: string
  date: string
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: review.date,
  }
}

/**
 * Generate Room/Accommodation schema markup
 */
export function generateAccommodationSchema(room: {
  name: string
  description: string
  image: string
  price: string
  amenities: string[]
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: room.name,
    description: room.description,
    image: room.image,
    priceRange: room.price,
    amenityFeature: room.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    })),
  }
}

/**
 * Generate BreadcrumbList schema markup
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
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

/**
 * Generate FAQPage schema markup
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
