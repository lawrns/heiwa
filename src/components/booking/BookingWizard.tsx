'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UsersIcon,
  BedIcon,
  PlusIcon,
  MinusIcon,
  DollarSignIcon
} from 'lucide-react'
import RoomGrid from './RoomGrid'

interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  surfLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  specialRequests: string
}

interface RoomSelection {
  roomId: string
  roomName: string
  type: 'private' | 'dorm'
  participants: string[] // participant IDs
  price: number
}

interface AddOn {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

interface BookingData {
  weekId: string
  participants: Participant[]
  roomSelections: RoomSelection[]
  addOns: AddOn[]
  totalAmount: number
  currency: string
}

interface BookingWizardProps {
  weekId: string
  onComplete: (bookingData: BookingData) => void
  onCancel: () => void
}

const STEPS = [
  { id: 'participants', title: 'Participants', icon: UsersIcon },
  { id: 'rooms', title: 'Rooms & Beds', icon: BedIcon },
  { id: 'addons', title: 'Add-ons', icon: PlusIcon },
  { id: 'summary', title: 'Summary', icon: CheckCircleIcon }
]

export default function BookingWizard({ weekId, onComplete, onCancel }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [bookingData, setBookingData] = useState<BookingData>({
    weekId,
    participants: [],
    roomSelections: [],
    addOns: [],
    totalAmount: 0,
    currency: 'MXN'
  })

  const [availableRooms] = useState<any[]>([
    {
      id: 'room-1',
      name: 'Ocean View Suite',
      capacity: 2,
      bookingType: 'whole',
      pricing: { standard: 1400, offSeason: 1200, camp: { 1: 1200, 2: 1100 } },
      amenities: ['private-bathroom', 'sea-view', 'balcony'],
      description: 'Beautiful ocean view suite',
      images: [],
      available: 2,
      totalSpots: 2
    },
    {
      id: 'room-2',
      name: 'Garden Bungalow',
      capacity: 2,
      bookingType: 'whole',
      pricing: { standard: 1200, offSeason: 1000, camp: { 1: 1000, 2: 900 } },
      amenities: ['private-bathroom', 'kitchen'],
      description: 'Cozy bungalow with garden views',
      images: [],
      available: 1,
      totalSpots: 2
    },
    {
      id: 'room-3',
      name: 'Beachfront Dorm',
      capacity: 8,
      bookingType: 'perBed',
      pricing: { standard: 150, offSeason: 120, camp: { perBed: 120 } },
      amenities: ['wifi', 'air-conditioning'],
      description: 'Shared beachfront accommodation',
      images: [],
      available: 5,
      totalSpots: 8
    }
  ])

  const [availableAddOns] = useState<AddOn[]>([
    { id: 'surf-lessons', name: 'Private Surf Lessons', description: '2-hour private surf instruction', price: 200, quantity: 0 },
    { id: 'yoga', name: 'Daily Yoga Sessions', description: 'Morning yoga on the beach', price: 150, quantity: 0 },
    { id: 'bike-rental', name: 'Bike Rental', description: 'Mountain bike rental for the week', price: 100, quantity: 0 },
    { id: 'photography', name: 'Surf Photography', description: 'Professional surf photo session', price: 300, quantity: 0 }
  ])

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      surfLevel: 'beginner',
      specialRequests: ''
    }
    setBookingData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }))
  }

  const removeParticipant = (id: string) => {
    setBookingData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setBookingData(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  }

  const updateAddOnQuantity = (id: string, quantity: number) => {
    setBookingData(prev => ({
      ...prev,
      addOns: prev.addOns.map(addon =>
        addon.id === id ? { ...addon, quantity } : addon
      )
    }))
  }

  const calculateTotal = () => {
    const roomTotal = bookingData.roomSelections.reduce((sum, room) => sum + room.price, 0)
    const addOnTotal = bookingData.addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0)
    return roomTotal + addOnTotal
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Participants
        return bookingData.participants.length > 0 &&
               bookingData.participants.every(p =>
                 p.firstName && p.lastName && p.email && p.phone && p.dateOfBirth
               )
      case 1: // Rooms
        return bookingData.roomSelections.length > 0
      case 2: // Add-ons
        return true // Optional step
      case 3: // Summary
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete booking and proceed to payment
      const finalBookingData = {
        ...bookingData,
        totalAmount: calculateTotal()
      }
      onComplete(finalBookingData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Participants
        return (
          <div className="space-y-6" data-testid="participants-step">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Who will be joining?</h3>
              <p className="text-gray-600">Add all participants for this booking</p>
            </div>

            <div className="space-y-4">
              {bookingData.participants.map((participant, index) => (
                <Card key={participant.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Participant {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        disabled={bookingData.participants.length === 1}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={participant.firstName}
                          onChange={(e) => updateParticipant(participant.id, { firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={participant.lastName}
                          onChange={(e) => updateParticipant(participant.id, { lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded-md"
                          value={participant.email}
                          onChange={(e) => updateParticipant(participant.id, { email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full p-2 border rounded-md"
                          value={participant.phone}
                          onChange={(e) => updateParticipant(participant.id, { phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                          type="date"
                          className="w-full p-2 border rounded-md"
                          value={participant.dateOfBirth}
                          onChange={(e) => updateParticipant(participant.id, { dateOfBirth: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Surf Level</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={participant.surfLevel}
                          onChange={(e) => updateParticipant(participant.id, { surfLevel: e.target.value as any })}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={addParticipant}
              variant="outline"
              className="w-full"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Another Participant
            </Button>
          </div>
        )

      case 1: // Rooms & Beds
        return (
          <div className="space-y-6" data-testid="rooms-step">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Your Accommodation</h3>
              <p className="text-gray-600">Select rooms and beds for your group</p>
            </div>

            <RoomGrid
              rooms={availableRooms}
              participants={bookingData.participants}
              selectedRooms={[]} // TODO: Implement room selection state
              onRoomSelection={(selection) => {
                // TODO: Handle room selection
                console.log('Room selected:', selection)
              }}
              onRoomDeselection={(roomId) => {
                // TODO: Handle room deselection
                console.log('Room deselected:', roomId)
              }}
            />
          </div>
        )

      case 2: // Add-ons
        return (
          <div className="space-y-6" data-testid="addons-step">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Enhance Your Experience</h3>
              <p className="text-gray-600">Add optional services to your booking</p>
            </div>

            <div className="space-y-4">
              {availableAddOns.map((addon) => (
                <Card key={addon.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{addon.name}</h4>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          ${addon.price} {addon.price > 200 ? 'per person' : 'total'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAddOnQuantity(addon.id, Math.max(0, addon.quantity - 1))}
                          disabled={addon.quantity === 0}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{addon.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAddOnQuantity(addon.id, addon.quantity + 1)}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 3: // Summary
        return (
          <div className="space-y-6" data-testid="summary-step">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
              <p className="text-gray-600">Review your booking details</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Participants ({bookingData.participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bookingData.participants.map((participant, index) => (
                      <div key={participant.id} className="flex justify-between text-sm">
                        <span>{participant.firstName} {participant.lastName}</span>
                        <Badge variant="outline">{participant.surfLevel}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Accommodation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500">
                    Room details will be shown here
                  </div>
                </CardContent>
              </Card>

              {bookingData.addOns.some(addon => addon.quantity > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {bookingData.addOns
                        .filter(addon => addon.quantity > 0)
                        .map((addon) => (
                          <div key={addon.id} className="flex justify-between text-sm">
                            <span>{addon.name} x{addon.quantity}</span>
                            <span>${addon.price * addon.quantity}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toLocaleString()} {bookingData.currency}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isActive
                      ? 'bg-oceanBlue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-oceanBlue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext()}
        >
          {currentStep === STEPS.length - 1 ? 'Complete Booking' : 'Next'}
          {currentStep < STEPS.length - 1 && <ArrowRightIcon className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
