'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Phone, Share2, MapPin, Palette } from 'lucide-react'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'
import { ImagePicker } from '@/components/admin/inline-editor/ImagePicker'

interface SiteSetting {
  key: string
  value: string
  category: string
}

interface SettingsState {
  // Contact
  contact_phone: string
  contact_email: string
  booking_email: string
  whatsapp_number: string
  address: string
  // Social
  instagram_url: string
  facebook_url: string
  // Location
  map_latitude: string
  map_longitude: string
  // Branding
  logo_url: string
}

const defaultSettings: SettingsState = {
  contact_phone: '',
  contact_email: '',
  booking_email: '',
  whatsapp_number: '',
  address: '',
  instagram_url: '',
  facebook_url: '',
  map_latitude: '',
  map_longitude: '',
  logo_url: '',
}

const fieldLabels: Record<keyof SettingsState, string> = {
  contact_phone: 'Phone Number',
  contact_email: 'Contact Email',
  booking_email: 'Booking Email',
  whatsapp_number: 'WhatsApp Number',
  address: 'Address',
  instagram_url: 'Instagram URL',
  facebook_url: 'Facebook URL',
  map_latitude: 'Map Latitude',
  map_longitude: 'Map Longitude',
  logo_url: 'Logo URL',
}

const fieldPlaceholders: Record<keyof SettingsState, string> = {
  contact_phone: '+351 123 456 789',
  contact_email: 'info@example.com',
  booking_email: 'bookings@example.com',
  whatsapp_number: '+351 123 456 789',
  address: '123 Beach Road, Ericeira, Portugal',
  instagram_url: 'https://instagram.com/yourpage',
  facebook_url: 'https://facebook.com/yourpage',
  map_latitude: '38.9661',
  map_longitude: '-9.4173',
  logo_url: '/images/logo.png',
}

const fieldCategories: Record<keyof SettingsState, string> = {
  contact_phone: 'contact',
  contact_email: 'contact',
  booking_email: 'contact',
  whatsapp_number: 'contact',
  address: 'contact',
  instagram_url: 'social',
  facebook_url: 'social',
  map_latitude: 'location',
  map_longitude: 'location',
  logo_url: 'branding',
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/cms/settings')
      const data = await res.json()

      if (data.success && data.data) {
        // Map the API response to our settings state
        setSettings({
          contact_phone: data.data.contact_phone || '',
          contact_email: data.data.contact_email || '',
          booking_email: data.data.booking_email || '',
          whatsapp_number: data.data.whatsapp_number || '',
          address: data.data.address || '',
          instagram_url: data.data.instagram_url || '',
          facebook_url: data.data.facebook_url || '',
          map_latitude: data.data.map_latitude || '',
          map_longitude: data.data.map_longitude || '',
          logo_url: data.data.logo_url || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Build the settings array for bulk update
      const settingsArray: SiteSetting[] = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || '',
        category: fieldCategories[key as keyof SettingsState],
      }))

      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsArray }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to save settings')
      }

      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
      console.error('Error saving site settings:', error)
      setMessage({ type: 'error', text: `Failed to save settings: ${errorMessage}` })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderTextField = (key: keyof SettingsState, type: 'text' | 'email' | 'tel' | 'url' | 'number' = 'text') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {fieldLabels[key]}
      </label>
      <input
        type={type}
        value={settings[key]}
        onChange={(e) => handleInputChange(key, e.target.value)}
        placeholder={fieldPlaceholders[key]}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>
  )

  return (
    <CMSLayout
      title="Site Settings"
      description="Manage contact information, social links, location, and branding"
      loading={loading}
    >
      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-orange-600" />
          <span className="text-lg font-semibold text-gray-900">Configuration</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-orange-600" />
            Contact Information
          </h2>
          <div className="space-y-4">
            {renderTextField('contact_phone', 'tel')}
            {renderTextField('contact_email', 'email')}
            {renderTextField('booking_email', 'email')}
            {renderTextField('whatsapp_number', 'tel')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {fieldLabels.address}
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={fieldPlaceholders.address}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Social Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-orange-600" />
            Social Media
          </h2>
          <div className="space-y-4">
            {renderTextField('instagram_url', 'url')}
            {renderTextField('facebook_url', 'url')}
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Location
          </h2>
          <div className="space-y-4">
            {renderTextField('map_latitude', 'number')}
            {renderTextField('map_longitude', 'number')}
            <p className="text-xs text-gray-500 mt-2">
              Enter the coordinates for the location marker on the map. You can find these on Google Maps by right-clicking a location.
            </p>
          </div>
        </div>

        {/* Branding Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-600" />
            Branding
          </h2>
          <div className="space-y-4">
            <ImagePicker
              value={settings.logo_url}
              onChange={(url) => handleInputChange('logo_url', url)}
              label={fieldLabels.logo_url}
              placeholder="Select a logo image..."
            />
            <p className="text-xs text-gray-500">
              Select a logo image from the media library, or enter a URL manually below.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (manual entry)
              </label>
              <input
                type="text"
                value={settings.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder={fieldPlaceholders.logo_url}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </CMSLayout>
  )
}
