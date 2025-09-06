'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Checkbox } from '@/components/ui/checkbox'
import { 
  BellIcon, 
  MailIcon, 
  MessageSquareIcon,
  MoonIcon,
  SunIcon,
  GlobeIcon,
  DollarSignIcon,
  CalendarIcon,
  WavesIcon,
  SaveIcon,
  ShieldIcon
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'react-toastify'

interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
    bookingReminders: boolean
    weatherAlerts: boolean
    newCamps: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'system'
    language: string
    currency: string
    timezone: string
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  }
  booking: {
    autoConfirm: boolean
    defaultParticipants: number
    preferredDuration: number[]
    roomPreference: 'shared' | 'private' | 'no-preference'
    boardPreference: 'longboard' | 'shortboard' | 'funboard' | 'no-preference'
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    shareBookingHistory: boolean
    allowReviews: boolean
    dataCollection: boolean
  }
  communication: {
    preferredContactMethod: 'email' | 'sms' | 'phone'
    communicationFrequency: 'minimal' | 'normal' | 'frequent'
    languagePreference: string
  }
}

export default function ClientPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      bookingReminders: true,
      weatherAlerts: true,
      newCamps: false
    },
    display: {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY'
    },
    booking: {
      autoConfirm: false,
      defaultParticipants: 1,
      preferredDuration: [7],
      roomPreference: 'no-preference',
      boardPreference: 'no-preference'
    },
    privacy: {
      profileVisibility: 'friends',
      shareBookingHistory: true,
      allowReviews: true,
      dataCollection: true
    },
    communication: {
      preferredContactMethod: 'email',
      communicationFrequency: 'normal',
      languagePreference: 'en'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load preferences from API
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Preferences saved successfully!')
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationPreference = (key: keyof UserPreferences['notifications'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updateDisplayPreference = (key: keyof UserPreferences['display'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }))
  }

  const updateBookingPreference = (key: keyof UserPreferences['booking'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      booking: {
        ...prev.booking,
        [key]: value
      }
    }))
  }

  const updatePrivacyPreference = (key: keyof UserPreferences['privacy'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const updateCommunicationPreference = (key: keyof UserPreferences['communication'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600">Customize your Heiwa House experience</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
          ) : (
            <SaveIcon className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BellIcon className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => updateNotificationPreference('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive text message alerts</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.sms}
                    onCheckedChange={(checked) => updateNotificationPreference('sms', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => updateNotificationPreference('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-gray-500">Promotional offers and updates</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.marketing}
                    onCheckedChange={(checked) => updateNotificationPreference('marketing', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-gray-500">Reminders about upcoming trips</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.bookingReminders}
                    onCheckedChange={(checked) => updateNotificationPreference('bookingReminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weather Alerts</Label>
                    <p className="text-sm text-gray-500">Surf and weather conditions</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.weatherAlerts}
                    onCheckedChange={(checked) => updateNotificationPreference('weatherAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Camp Announcements</Label>
                    <p className="text-sm text-gray-500">Be first to know about new camps</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.newCamps}
                    onCheckedChange={(checked) => updateNotificationPreference('newCamps', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SunIcon className="w-5 h-5" />
                <span>Display Settings</span>
              </CardTitle>
              <CardDescription>Customize your interface preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.display.theme}
                    onValueChange={(value: any) => updateDisplayPreference('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.display.language}
                    onValueChange={(value) => updateDisplayPreference('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={preferences.display.currency}
                    onValueChange={(value) => updateDisplayPreference('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.display.dateFormat}
                    onValueChange={(value: any) => updateDisplayPreference('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <WavesIcon className="w-5 h-5" />
                <span>Booking Preferences</span>
              </CardTitle>
              <CardDescription>Set your default booking preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-confirm bookings</Label>
                    <p className="text-sm text-gray-500">Automatically confirm available bookings</p>
                  </div>
                  <Switch
                    checked={preferences.booking.autoConfirm}
                    onCheckedChange={(checked) => updateBookingPreference('autoConfirm', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Participants</Label>
                  <Select
                    value={preferences.booking.defaultParticipants.toString()}
                    onValueChange={(value) => updateBookingPreference('defaultParticipants', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} participant{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Camp Duration</Label>
                  <Select
                    value={preferences.booking.preferredDuration[0].toString()}
                    onValueChange={(value) => updateBookingPreference('preferredDuration', [parseInt(value)])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="10">10 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="21">21 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room Preference</Label>
                  <Select
                    value={preferences.booking.roomPreference}
                    onValueChange={(value: any) => updateBookingPreference('roomPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Shared Room</SelectItem>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Board Preference</Label>
                  <Select
                    value={preferences.booking.boardPreference}
                    onValueChange={(value: any) => updateBookingPreference('boardPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="longboard">Longboard</SelectItem>
                      <SelectItem value="shortboard">Shortboard</SelectItem>
                      <SelectItem value="funboard">Funboard</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Communication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldIcon className="w-5 h-5" />
                <span>Privacy & Communication</span>
              </CardTitle>
              <CardDescription>Control your privacy and communication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={preferences.privacy.profileVisibility}
                    onValueChange={(value: any) => updatePrivacyPreference('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <Select
                    value={preferences.communication.preferredContactMethod}
                    onValueChange={(value: any) => updateCommunicationPreference('preferredContactMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Booking History</Label>
                    <p className="text-sm text-gray-500">Allow others to see your past trips</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.shareBookingHistory}
                    onCheckedChange={(checked) => updatePrivacyPreference('shareBookingHistory', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Reviews</Label>
                    <p className="text-sm text-gray-500">Let others review your participation</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.allowReviews}
                    onCheckedChange={(checked) => updatePrivacyPreference('allowReviews', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Collection</Label>
                    <p className="text-sm text-gray-500">Help improve our services with usage data</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.dataCollection}
                    onCheckedChange={(checked) => updatePrivacyPreference('dataCollection', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
