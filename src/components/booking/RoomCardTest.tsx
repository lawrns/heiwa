'use client'

import { useState } from 'react'
import RoomGrid from './RoomGrid'

export default function RoomCardTest() {
  const [selectedRooms, setSelectedRooms] = useState<any[]>([])

  // Sample room data for testing
  const sampleRooms = [
    {
      id: 'room-1',
      name: 'Ocean View Suite',
      capacity: 2,
      bookingType: 'whole' as const,
      pricing: {
        standard: 1400,
        offSeason: 1200,
        camp: { 1: 1200, 2: 1100 }
      },
      amenities: ['private-bathroom', 'sea-view', 'balcony'],
      description: 'Beautiful ocean view suite with premium amenities',
      images: [],
      available: 2,
      totalSpots: 2
    },
    {
      id: 'room-2',
      name: 'Garden Bungalow',
      capacity: 2,
      bookingType: 'whole' as const,
      pricing: {
        standard: 1200,
        offSeason: 1000,
        camp: { 1: 1000, 2: 900 }
      },
      amenities: ['private-bathroom', 'kitchen'],
      description: 'Cozy bungalow with lush garden views',
      images: [],
      available: 1,
      totalSpots: 2
    },
    {
      id: 'room-3',
      name: 'Beachfront Dorm',
      capacity: 8,
      bookingType: 'perBed' as const,
      pricing: {
        standard: 150,
        offSeason: 120,
        camp: { perBed: 120 }
      },
      amenities: ['wifi', 'air-conditioning'],
      description: 'Shared beachfront accommodation with great vibes',
      images: [],
      available: 5,
      totalSpots: 8
    }
  ]

  const sampleParticipants = [
    {
      id: 'participant-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      surfLevel: 'intermediate',
      specialRequests: 'Vegetarian meals'
    },
    {
      id: 'participant-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1234567890',
      surfLevel: 'beginner',
      specialRequests: ''
    }
  ]

  const handleRoomSelection = (selection: any) => {
    setSelectedRooms(prev => {
      const existing = prev.find(s => s.roomId === selection.roomId)
      if (existing) {
        return prev.filter(s => s.roomId !== selection.roomId)
      } else {
        return [...prev, selection]
      }
    })
  }

  const handleRoomDeselection = (roomId: string) => {
    setSelectedRooms(prev => prev.filter(s => s.roomId !== roomId))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Room Card Test - Beautiful Hero Cards
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Features:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Large hero cards with background images</li>
            <li>✅ Heiwa orange (#ec681c) branding integration</li>
            <li>✅ Sophisticated hover and selection animations</li>
            <li>✅ Accessibility features (ARIA labels, keyboard navigation)</li>
            <li>✅ Reduced motion support for accessibility</li>
            <li>✅ Responsive design for all screen sizes</li>
            <li>✅ Image fallbacks and loading states</li>
            <li>✅ Surf-themed wave patterns and gradients</li>
          </ul>
        </div>

        <RoomGrid
          rooms={sampleRooms}
          participants={sampleParticipants}
          selectedRooms={selectedRooms}
          onRoomSelection={handleRoomSelection}
          onRoomDeselection={handleRoomDeselection}
        />

        {selectedRooms.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Rooms (Debug):</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(selectedRooms, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
