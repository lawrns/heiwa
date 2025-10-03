import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Heiwa House',
  description: 'Privacy Policy for Heiwa House - How we collect, use, and protect your personal information',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-4 text-gray-600">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when making a booking, including:
          </p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Dietary requirements and special requests</li>
            <li>Emergency contact information</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Process your bookings and payments</li>
            <li>Communicate with you about your reservation</li>
            <li>Provide customer support</li>
            <li>Send you important updates about your stay</li>
            <li>Improve our services</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share your information with:
          </p>
          <ul>
            <li>Payment processors (Stripe) to handle transactions</li>
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information.
            All payment information is encrypted and processed through secure, PCI-compliant payment gateways.
          </p>

          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to improve your browsing experience and analyze site traffic.
            You can control cookie settings through your browser preferences.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Under GDPR and applicable data protection laws, you have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Request data portability</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy,
            unless a longer retention period is required by law.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at:
          </p>
          <ul>
            <li>Email: info@heiwahouse.com</li>
            <li>Phone: +351 912 193 785</li>
            <li>Address: Heiwa House, Santa Cruz, Portugal</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
