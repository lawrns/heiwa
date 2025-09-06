'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  SaveIcon,
  EditIcon,
  CameraIcon,
  ShieldCheckIcon
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'react-toastify'

interface UserProfile {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  surfingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  medicalConditions: string
  dietaryRestrictions: string
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  memberSince: string
  totalBookings: number
  preferredBrand: 'Heiwa House' | 'Freedom Routes' | 'Both'
}

export default function ClientProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    surfingExperience: 'beginner',
    medicalConditions: '',
    dietaryRestrictions: '',
    tshirtSize: 'M',
    memberSince: '2024-01-01',
    totalBookings: 0,
    preferredBrand: 'Both'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load profile data
  useEffect(() => {
    // Mock profile data
    const mockProfile: UserProfile = {
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-05-15',
      nationality: 'United States',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1 (555) 987-6543',
        relationship: 'Spouse'
      },
      surfingExperience: 'intermediate',
      medicalConditions: 'None',
      dietaryRestrictions: 'Vegetarian',
      tshirtSize: 'L',
      memberSince: '2023-06-15',
      totalBookings: 3,
      preferredBrand: 'Heiwa House'
    }

    setTimeout(() => {
      setProfile(mockProfile)
      setLoading(false)
    }, 1000)
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
    // In a real app, you'd reload from the server
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
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
                ) : (
                  <SaveIcon className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <EditIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="w-24 h-24 bg-oceanBlue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-oceanBlue-600" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-oceanBlue-600 rounded-full flex items-center justify-center text-white hover:bg-oceanBlue-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-oceanBlue-100 text-oceanBlue-800">
                  {profile.surfingExperience}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-medium">{new Date(profile.memberSince).toLocaleDateString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Preferred Brand</div>
                <Badge className="mt-1">{profile.preferredBrand}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profile.nationality}
                    onChange={(e) => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tshirtSize">T-Shirt Size</Label>
                  <Select
                    value={profile.tshirtSize}
                    onValueChange={(value: any) => setProfile(prev => ({ ...prev, tshirtSize: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={profile.emergencyContact.name}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={profile.emergencyContact.phone}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={profile.emergencyContact.relationship}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surfing & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Surfing & Preferences</CardTitle>
              <CardDescription>Your surfing experience and camp preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surfingExperience">Surfing Experience</Label>
                  <Select
                    value={profile.surfingExperience}
                    onValueChange={(value: any) => setProfile(prev => ({ ...prev, surfingExperience: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredBrand">Preferred Brand</Label>
                  <Select
                    value={profile.preferredBrand}
                    onValueChange={(value: any) => setProfile(prev => ({ ...prev, preferredBrand: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Heiwa House">Heiwa House</SelectItem>
                      <SelectItem value="Freedom Routes">Freedom Routes</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Any medical conditions we should be aware of..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  value={profile.dietaryRestrictions}
                  onChange={(e) => setProfile(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Any dietary restrictions or allergies..."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
