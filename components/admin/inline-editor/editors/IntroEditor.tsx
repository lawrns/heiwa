'use client'

interface IntroContent {
  title?: string
  content?: string
  // Contact page variant
  phone?: string
  email?: string
  address?: string
}

interface IntroEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function IntroEditor({ content, onChange }: IntroEditorProps) {
  const data = content as IntroContent

  const updateField = (field: keyof IntroContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  // Detect if this is a contact-style intro (has phone/email/address)
  const isContactIntro = 'phone' in data || 'email' in data || 'address' in data

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Section title"
        />
      </div>

      {!isContactIntro && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported)</label>
          <textarea
            value={data.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 font-mono text-sm"
            placeholder="<p>Your intro content here...</p>"
          />
          <p className="text-xs text-gray-500 mt-1">You can use basic HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;.</p>
        </div>
      )}

      {isContactIntro && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={data.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
              placeholder="+351 915 215 883"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
              placeholder="bookings@heiwahouse.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
              placeholder="Ericeira, Portugal"
            />
          </div>
        </>
      )}
    </div>
  )
}
