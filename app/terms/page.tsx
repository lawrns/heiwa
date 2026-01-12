import { generatePageMetadata } from '@/lib/page-metadata'

// Force dynamic rendering - content fetched at runtime
export const dynamic = 'force-dynamic'

// Generate SEO metadata from database
export async function generateMetadata() {
  return generatePageMetadata('terms')
}

interface LegalContent {
  title: string
  lastUpdated: string
  content: string
}

interface PageSection {
  id: string
  page_slug: string
  section_type: string
  content: LegalContent
  order_index: number
  is_active: boolean
}

// Fallback content in case CMS fetch fails
const fallbackContent: LegalContent = {
  title: 'Terms and Conditions',
  lastUpdated: 'January 2025',
  content: `
    <h2>1. Booking and Reservations</h2>
    <p>By making a booking at Heiwa House, you agree to these terms and conditions. All bookings are subject to availability and confirmation.</p>

    <h2>2. Payment Terms</h2>
    <p>Full payment is required at the time of booking. We accept credit card payments via Stripe and bank wire transfers. For bank wire transfers, reservations are confirmed upon receipt of payment.</p>

    <h2>3. Cancellation Policy</h2>
    <ul>
      <li>Cancellations made more than 30 days before check-in: Full refund minus 10% administrative fee</li>
      <li>Cancellations made 15-30 days before check-in: 50% refund</li>
      <li>Cancellations made less than 15 days before check-in: No refund</li>
    </ul>

    <h2>4. Check-in and Check-out</h2>
    <p>Check-in time is from 15:00 onwards. Check-out time is by 10:00. Early check-in or late check-out may be available upon request and subject to availability.</p>

    <h2>5. House Rules</h2>
    <ul>
      <li>Respect quiet hours between 22:00 and 08:00</li>
      <li>No smoking inside the property</li>
      <li>Guests are responsible for any damages to the property</li>
      <li>Maximum occupancy limits must be respected</li>
    </ul>

    <h2>6. Surf Weeks and Activities</h2>
    <p>Surf lessons and other activities are weather-dependent. We reserve the right to modify or cancel activities due to safety concerns. No refunds will be provided for weather-related cancellations, but alternative activities will be offered when possible.</p>

    <h2>7. Liability</h2>
    <p>Heiwa House is not liable for any personal injury, loss, or damage to personal belongings during your stay. Guests participate in surf activities and other recreational activities at their own risk.</p>

    <h2>8. Changes to Terms</h2>
    <p>We reserve the right to update these terms and conditions at any time. Continued use of our services constitutes acceptance of any changes.</p>

    <h2>9. Contact Information</h2>
    <p>For any questions regarding these terms and conditions, please contact us at:</p>
    <ul>
      <li>Email: info@heiwahouse.com</li>
      <li>Phone: +351 912 193 785</li>
      <li>Address: Heiwa House, Santa Cruz, Portugal</li>
    </ul>
  `
}

async function getTermsContent(): Promise<LegalContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/cms/pages/terms/sections`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })

    if (!response.ok) {
      console.error('Failed to fetch terms content:', response.statusText)
      return fallbackContent
    }

    const result = await response.json()

    if (!result.success || !result.data || result.data.length === 0) {
      return fallbackContent
    }

    // Find the legal_content section
    const legalSection = result.data.find(
      (section: PageSection) => section.section_type === 'legal_content'
    )

    if (!legalSection || !legalSection.content) {
      return fallbackContent
    }

    return legalSection.content as LegalContent
  } catch (error) {
    console.error('Error fetching terms content:', error)
    return fallbackContent
  }
}

function formatDate(dateString: string): string {
  // Handle both YYYY-MM-DD format and "Month Year" format
  if (dateString.includes('-')) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }
  return dateString
}

export default async function TermsPage() {
  const content = await getTermsContent()

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">{content.title}</h1>
          <p className="mt-4 text-gray-600">Last updated: {formatDate(content.lastUpdated)}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </div>
    </div>
  )
}
