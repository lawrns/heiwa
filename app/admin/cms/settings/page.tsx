'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Database, Key, Globe } from 'lucide-react'

export default function CMSSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Heiwa House',
    siteDescription: 'A Wave Away | Surf & Adventure Retreat',
    defaultLanguage: 'en',
    enableCache: true,
    cacheDuration: 3600,
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/cms/settings')
        const data = await res.json()
        if (data.success && data.settings) {
          setSettings({
            siteName: data.settings.site_name,
            siteDescription: data.settings.site_description,
            defaultLanguage: data.settings.default_language,
            enableCache: data.settings.enable_cache,
            cacheDuration: data.settings.cache_duration,
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/admin/cms/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          default_language: settings.defaultLanguage,
          enable_cache: settings.enableCache,
          cache_duration: settings.cacheDuration,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleClearCache = async () => {
    setLoading(true)
    try {
      // In a real app, this would call an API to invalidate CDN/Server cache
      // For now, we just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Cache cleared successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear cache' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-600" />
            CMS Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage CMS configuration and preferences</p>
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
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-600" />
            General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cache Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            Cache Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enable Cache
                </label>
                <p className="text-sm text-gray-500">Cache content for better performance</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCache}
                onChange={(e) => setSettings({ ...settings, enableCache: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
            </div>
            {settings.enableCache && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cache Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.cacheDuration}
                  onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) || 3600 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}
            <button
              onClick={handleClearCache}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Clear Cache
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-600" />
            API Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps API Key
              </label>
              <input
                type="password"
                value="••••••••••••••••"
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Configured via environment variables</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'Not configured'}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

