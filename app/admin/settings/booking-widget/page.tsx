'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Euro, Home, Waves, AlertCircle, CheckCircle } from 'lucide-react'

interface BookingWidgetSetting {
  id: string
  experience_type: 'room' | 'surf-week'
  price_from: number
  is_active: boolean
}

export default function BookingWidgetSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<BookingWidgetSetting[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/booking-widget-settings')
      const data = await response.json()

      if (data.success && data.data) {
        setSettings(data.data)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load settings' })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Error loading settings' })
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (experienceType: 'room' | 'surf-week', value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) return

    setSettings(prev =>
      prev.map(setting =>
        setting.experience_type === experienceType
          ? { ...setting, price_from: numValue }
          : setting
      )
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Validate settings
      for (const setting of settings) {
        if (setting.price_from < 0) {
          setMessage({ type: 'error', text: 'Prices must be positive numbers' })
          setSaving(false)
          return
        }
        if (setting.price_from > 10000) {
          setMessage({ type: 'error', text: 'Prices seem unusually high. Please verify.' })
          setSaving(false)
          return
        }
      }

      const response = await fetch('/api/admin/booking-widget-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Error saving settings' })
    } finally {
      setSaving(false)
    }
  }

  const roomSetting = settings.find(s => s.experience_type === 'room')
  const surfWeekSetting = settings.find(s => s.experience_type === 'surf-week')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Widget Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure the "from" price points displayed in the booking widget experience selection
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Room Booking Price */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Room Booking</h2>
                  <p className="text-sm text-gray-600">Starting price for room bookings</p>
                </div>
              </div>
              <div className="ml-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "From" Price (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomSetting?.price_from || 45}
                    onChange={(e) => handlePriceChange('room', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-[border-color,box-shadow] duration-200"
                    placeholder="45.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This price will appear as "from €{roomSetting?.price_from || 45}" in the booking widget
                </p>
              </div>
            </div>

            {/* Surf Week Price */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Waves className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All-Inclusive Surf Week</h2>
                  <p className="text-sm text-gray-600">Starting price for surf week packages</p>
                </div>
              </div>
              <div className="ml-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "From" Price (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={surfWeekSetting?.price_from || 599}
                    onChange={(e) => handlePriceChange('surf-week', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-[border-color,box-shadow] duration-200"
                    placeholder="599.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This price will appear as "FROM €{surfWeekSetting?.price_from || 599}" in the booking widget
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Note:</p>
              <p>
                These prices are displayed as starting points in the booking widget. Actual pricing
                for individual surf weeks and rooms may vary based on dates, occupancy, and other factors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

