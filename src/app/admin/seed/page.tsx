'use client'

import { useState } from 'react'
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'react-toastify'

// Sample data for seeding
const sampleData = {
  clients: [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      nationality: 'American',
      dateOfBirth: '1990-05-15',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      },
      surfingExperience: 'intermediate',
      medicalConditions: 'None',
      dietaryRestrictions: 'Vegetarian',
      tshirtSize: 'L',
      memberSince: '2023-06-15',
      totalBookings: 3,
      preferredBrand: 'Heiwa House',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1-555-0125',
      nationality: 'Spanish',
      dateOfBirth: '1985-08-22',
      emergencyContact: {
        name: 'Carlos Garcia',
        phone: '+1-555-0126',
        relationship: 'Brother'
      },
      surfingExperience: 'beginner',
      medicalConditions: 'None',
      dietaryRestrictions: 'None',
      tshirtSize: 'M',
      memberSince: '2024-01-10',
      totalBookings: 1,
      preferredBrand: 'Freedom Routes',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1-555-0127',
      nationality: 'Canadian',
      dateOfBirth: '1992-12-03',
      emergencyContact: {
        name: 'Sarah Johnson',
        phone: '+1-555-0128',
        relationship: 'Sister'
      },
      surfingExperience: 'advanced',
      medicalConditions: 'Mild asthma',
      dietaryRestrictions: 'Gluten-free',
      tshirtSize: 'XL',
      memberSince: '2022-03-20',
      totalBookings: 8,
      preferredBrand: 'Both',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  rooms: [
    {
      name: 'Ocean View Suite',
      type: 'private',
      capacity: 2,
      amenities: ['Ocean View', 'Private Bathroom', 'Air Conditioning', 'WiFi'],
      pricePerNight: 150,
      isAvailable: true,
      description: 'Luxurious suite with stunning ocean views',
      images: ['ocean-suite-1.jpg', 'ocean-suite-2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Shared Dorm A',
      type: 'shared',
      capacity: 6,
      amenities: ['Shared Bathroom', 'Lockers', 'WiFi', 'Common Area'],
      pricePerNight: 45,
      isAvailable: true,
      description: 'Budget-friendly shared accommodation',
      images: ['dorm-a-1.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Garden Bungalow',
      type: 'private',
      capacity: 4,
      amenities: ['Garden View', 'Private Bathroom', 'Kitchenette', 'WiFi', 'Terrace'],
      pricePerNight: 120,
      isAvailable: true,
      description: 'Cozy bungalow surrounded by tropical gardens',
      images: ['bungalow-1.jpg', 'bungalow-2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  surfCamps: [
    {
      name: 'Beginner Surf Camp',
      description: 'Perfect for those new to surfing with daily lessons and equipment included',
      duration: 7,
      maxParticipants: 12,
      pricePerPerson: 800,
      difficulty: 'beginner',
      location: 'Heiwa House, Costa Rica',
      brand: 'Heiwa House',
      includes: ['Daily surf lessons', 'Equipment rental', 'Accommodation', 'Meals', 'Airport transfer'],
      startDates: ['2024-03-01', '2024-03-15', '2024-04-01', '2024-04-15', '2024-05-01'],
      isActive: true,
      images: ['beginner-camp-1.jpg', 'beginner-camp-2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Advanced Surf Camp',
      description: 'For experienced surfers looking to improve with professional coaching',
      duration: 10,
      maxParticipants: 8,
      pricePerPerson: 1200,
      difficulty: 'advanced',
      location: 'Freedom Routes, Nicaragua',
      brand: 'Freedom Routes',
      includes: ['Advanced coaching', 'Video analysis', 'Premium equipment', 'Accommodation', 'Nutrition plan'],
      startDates: ['2024-03-10', '2024-04-10', '2024-05-10', '2024-06-10'],
      isActive: true,
      images: ['advanced-camp-1.jpg', 'advanced-camp-2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Family Surf Camp',
      description: 'Family-friendly camp with activities for all ages and skill levels',
      duration: 5,
      maxParticipants: 16,
      pricePerPerson: 600,
      difficulty: 'beginner',
      location: 'Heiwa House, Costa Rica',
      brand: 'Heiwa House',
      includes: ['Family lessons', 'Kids activities', 'Equipment for all ages', 'Accommodation', 'Family meals'],
      startDates: ['2024-03-20', '2024-04-20', '2024-05-20', '2024-06-20'],
      isActive: true,
      images: ['family-camp-1.jpg', 'family-camp-2.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  bookings: [
    {
      clientName: 'John Doe',
      clientEmail: 'john.doe@example.com',
      surfCampName: 'Beginner Surf Camp',
      startDate: '2024-02-15',
      endDate: '2024-02-22',
      participants: 2,
      totalAmount: 1600,
      status: 'confirmed',
      paymentStatus: 'paid',
      roomName: 'Ocean View Suite',
      specialRequests: 'Vegetarian meals please',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      clientName: 'Maria Garcia',
      clientEmail: 'maria.garcia@example.com',
      surfCampName: 'Family Surf Camp',
      startDate: '2024-03-20',
      endDate: '2024-03-25',
      participants: 1,
      totalAmount: 600,
      status: 'pending',
      paymentStatus: 'pending',
      roomName: 'Shared Dorm A',
      specialRequests: 'First time surfing, please be patient',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

export default function SeedPage() {
  const { user } = useAuth()
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleSeed = async () => {
    if (!user?.isAdmin) {
      toast.error('Admin access required')
      return
    }

    setSeeding(true)
    try {
      let totalSeeded = 0

      for (const [collectionName, documents] of Object.entries(sampleData)) {
        for (const doc of documents) {
          await addDoc(collection(db, collectionName), doc)
          totalSeeded++
        }
      }

      toast.success(`Successfully seeded ${totalSeeded} documents!`)
    } catch (error) {
      console.error('Seeding error:', error)
      toast.error('Failed to seed database')
    } finally {
      setSeeding(false)
    }
  }

  const handleClear = async () => {
    if (!user?.isAdmin) {
      toast.error('Admin access required')
      return
    }

    setClearing(true)
    try {
      const collections = ['clients', 'rooms', 'surfCamps', 'bookings']
      let totalDeleted = 0

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName))
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
        totalDeleted += snapshot.docs.length
      }

      toast.success(`Successfully cleared ${totalDeleted} documents!`)
    } catch (error) {
      console.error('Clearing error:', error)
      toast.error('Failed to clear database')
    } finally {
      setClearing(false)
    }
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin privileges required to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Seeding</h1>
        <p className="text-gray-600">Manage sample data for development and testing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>
              Add sample data including clients, rooms, surf camps, and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>This will add:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{sampleData.clients.length} sample clients</li>
                  <li>{sampleData.rooms.length} sample rooms</li>
                  <li>{sampleData.surfCamps.length} sample surf camps</li>
                  <li>{sampleData.bookings.length} sample bookings</li>
                </ul>
              </div>
              <Button 
                onClick={handleSeed} 
                disabled={seeding}
                className="w-full"
              >
                {seeding ? 'Seeding...' : 'Seed Database'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clear Database</CardTitle>
            <CardDescription>
              Remove all data from the database (use with caution)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-red-600">
                <p>⚠️ This will permanently delete all data in:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Clients collection</li>
                  <li>Rooms collection</li>
                  <li>Surf camps collection</li>
                  <li>Bookings collection</li>
                </ul>
              </div>
              <Button 
                onClick={handleClear} 
                disabled={clearing}
                variant="destructive"
                className="w-full"
              >
                {clearing ? 'Clearing...' : 'Clear Database'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
