'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  BedIcon,
  UsersIcon,
  WifiIcon,
  CoffeeIcon,
  EyeIcon,
  BathIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon
} from 'lucide-react'

interface Room {
  id: string
  name: string
  capacity: number
  bookingType: 'whole' | 'perBed'
  pricing: {
    standard: number
    offSeason: number
    camp: { [key: string]: number } | { perBed: number }
  }
  amenities: string[]
  description: string
  images: string[]
  available: number // Number of available spots
  totalSpots: number
}

interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  surfLevel: string
  specialRequests: string
}

interface RoomSelection {
  roomId: string
  participantIds: string[]
  type: 'whole' | 'perBed'
}

interface RoomGridProps {
  rooms: Room[]
  participants: Participant[]
  selectedRooms: RoomSelection[]
  onRoomSelection: (selection: RoomSelection) => void
  onRoomDeselection: (roomId: string) => void
}

const AVAILABLE_AMENITIES = {
  'private-bathroom': { icon: BathIcon, label: 'Private Bathroom' },
  'sea-view': { icon: EyeIcon, label: 'Sea View' },
  'wifi': { icon: WifiIcon, label: 'WiFi' },
  'kitchen': { icon: CoffeeIcon, label: 'Kitchen' },
  'balcony': { icon: EyeIcon, label: 'Balcony' },
  'air-conditioning': { icon: WifiIcon, label: 'Air Conditioning' }
}

export default function RoomGrid({
  rooms,
  participants,
  selectedRooms,
  onRoomSelection,
  onRoomDeselection
}: RoomGridProps) {
  const [selectedMode, setSelectedMode] = useState<'whole' | 'perBed'>('whole')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect user's motion preference for accessibility
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Preload images for better performance
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      rooms.forEach(room => {
        const getRoomImage = (room: Room) => {
          if (room.name.toLowerCase().includes('ocean') || room.name.toLowerCase().includes('suite')) {
            return '/room1.jpg'
          } else if (room.name.toLowerCase().includes('garden') || room.name.toLowerCase().includes('bungalow')) {
            return '/room2.webp'
          } else if (room.name.toLowerCase().includes('dorm') || room.name.toLowerCase().includes('beachfront')) {
            return '/dorm.webp'
          }
          return '/room3.webp'
        }

        const img = new Image()
        img.src = getRoomImage(room)
      })
    }
  }, [rooms])

  // Filter rooms based on selected mode
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (selectedMode === 'whole') {
        return room.bookingType === 'whole'
      } else {
        return room.bookingType === 'perBed'
      }
    })
  }, [rooms, selectedMode])

  // Check if a room is selected
  const isRoomSelected = (roomId: string) => {
    return selectedRooms.some(selection => selection.roomId === roomId)
  }

  // Get selection details for a room
  const getRoomSelection = (roomId: string) => {
    return selectedRooms.find(selection => selection.roomId === roomId)
  }

  // Handle room selection
  const handleRoomSelect = (room: Room) => {
    if (isRoomSelected(room.id)) {
      onRoomDeselection(room.id)
    } else {
      if (selectedMode === 'whole') {
        // For whole room, assign all participants
        const participantIds = participants.map(p => p.id)
        onRoomSelection({
          roomId: room.id,
          participantIds,
          type: 'whole'
        })
      } else {
        // For per-bed, we'll handle individual bed assignment
        onRoomSelection({
          roomId: room.id,
          participantIds: [],
          type: 'perBed'
        })
      }
    }
  }

  // Handle bed assignment for per-bed rooms
  const handleBedAssignment = (roomId: string, bedIndex: number, participantId: string | null) => {
    const selection = getRoomSelection(roomId)
    if (!selection) return

    const updatedParticipantIds = [...selection.participantIds]

    if (participantId === null) {
      // Remove assignment
      updatedParticipantIds.splice(bedIndex, 1)
    } else {
      // Add assignment
      updatedParticipantIds[bedIndex] = participantId
    }

    onRoomSelection({
      ...selection,
      participantIds: updatedParticipantIds
    })
  }

  // Get participant name by ID
  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id)
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown'
  }

  // Get available participants for assignment
  const getAvailableParticipants = (roomId: string) => {
    const assignedIds = selectedRooms
      .filter(s => s.roomId !== roomId)
      .flatMap(s => s.participantIds)

    return participants.filter(p => !assignedIds.includes(p.id))
  }

  // Render room card
  const renderRoomCard = (room: Room) => {
    const isSelected = isRoomSelected(room.id)
    const selection = getRoomSelection(room.id)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Get appropriate background image and fallback gradient based on room type
    const getRoomImageConfig = (room: Room) => {
      let imageSrc = ''
      let fallbackGradient = ''

      if (room.name.toLowerCase().includes('ocean') || room.name.toLowerCase().includes('suite')) {
        imageSrc = '/room1.jpg'
        fallbackGradient = 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' // Ocean blue gradient
      } else if (room.name.toLowerCase().includes('garden') || room.name.toLowerCase().includes('bungalow')) {
        imageSrc = '/room2.webp'
        fallbackGradient = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' // Garden green gradient
      } else if (room.name.toLowerCase().includes('dorm') || room.name.toLowerCase().includes('beachfront')) {
        imageSrc = '/dorm.webp'
        fallbackGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' // Beach sand gradient
      } else {
        imageSrc = '/room3.webp'
        fallbackGradient = 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' // Luxury pink gradient
      }

      return { imageSrc, fallbackGradient }
    }

    const { imageSrc, fallbackGradient } = getRoomImageConfig(room)

    return (
      <motion.div
        key={room.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
        className="group"
      >
        <motion.div
          className={`
            relative cursor-pointer overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400 focus-visible:ring-opacity-50
            ${room.available === 0 ? 'opacity-60 cursor-not-allowed' : ''}
            bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50
            min-h-[280px] md:min-h-[320px]
            transition-all duration-200
          `}
          whileHover={room.available > 0 && !prefersReducedMotion ? {
            scale: 1.02,
            transition: { duration: 0.3, ease: "easeOut" }
          } : {}}
          whileTap={room.available > 0 && !prefersReducedMotion ? {
            scale: 0.98,
            transition: { duration: 0.1 }
          } : {}}
          animate={isSelected && !prefersReducedMotion ? {
            ringColor: "#fb923c",
            ringWidth: 4,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(251, 146, 60, 0.2)",
            transition: { duration: 0.3 }
          } : isSelected ? {
            ringColor: "#fb923c",
            ringWidth: 4,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(251, 146, 60, 0.2)"
          } : {
            ringColor: "transparent",
            ringWidth: 0,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
          }}
          onClick={() => room.available > 0 && handleRoomSelect(room)}
          role="button"
          tabIndex={room.available > 0 ? 0 : -1}
          aria-label={`${isSelected ? 'Selected' : 'Select'} ${room.name} - ${room.description}. ${room.available} spots available out of ${room.totalSpots}. ${room.capacity} guests capacity. Price: $${room.pricing.standard} per ${selectedMode === 'whole' ? 'room' : 'bed'}. Amenities: ${room.amenities.join(', ')}.`}
          aria-pressed={isSelected}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && room.available > 0) {
              e.preventDefault()
              handleRoomSelect(room)
            }
          }}
          onFocus={(e) => {
            // Scroll into view on mobile when focused
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              e.currentTarget.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'center'
              })
            }
          }}
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0">
            {/* Fallback gradient background */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'}`}
              style={{ background: fallbackGradient }}
            />

            {/* Main image with parallax effect */}
            <motion.img
              src={imageSrc}
              alt={`${room.name} - ${room.description}`}
              className={`w-full h-full object-cover ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              animate={{
                scale: isSelected ? 1.1 : 1,
                x: 0
              }}
              whileHover={room.available > 0 ? {
                scale: 1.05,
                x: -5,
                transition: { duration: 0.3 }
              } : {}}
            />

            {/* Gradient Overlay */}
            <div className={`
              absolute inset-0 transition-all duration-500
              ${isSelected
                ? 'bg-gradient-to-br from-orange-500/80 via-orange-400/70 to-blue-600/60'
                : 'bg-gradient-to-br from-orange-600/70 via-orange-500/60 to-blue-700/50 group-hover:from-orange-500/80 group-hover:via-orange-400/70 group-hover:to-blue-600/60'
              }
            `} />

            {/* Loading shimmer effect */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}

            {/* Subtle wave pattern overlay for surf theme */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id={`wave-${room.id}`} x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M0,10 Q25,0 50,10 T100,10"
                      stroke="white"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#wave-${room.id})`} />
              </svg>
            </div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
            {/* Top Section - Title and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">
                  {room.name}
                </h3>
                <p className="text-base text-white/90 drop-shadow-md">
                  {room.description}
                </p>
              </div>

              {/* Availability Badge */}
              <div className="ml-4 flex-shrink-0">
                {room.available > 0 ? (
                  <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                    ✓ Available
                  </div>
                ) : (
                  <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                    ✗ Full
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - Capacity and Amenities */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <UsersIcon className="w-4 h-4" />
                  <span className="font-medium">{room.capacity} guests</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <BedIcon className="w-4 h-4" />
                  <span className="font-medium">{room.available}/{room.totalSpots} available</span>
                </div>
              </div>

              {/* Amenities Preview */}
              <div className="flex space-x-1">
                {room.amenities.slice(0, 3).map((amenityId) => {
                  const amenity = AVAILABLE_AMENITIES[amenityId as keyof typeof AVAILABLE_AMENITIES]
                  if (!amenity) return null
                  const Icon = amenity.icon
                  return (
                    <div key={amenityId} className="bg-white/30 backdrop-blur-sm p-2 rounded-full" title={amenity.label}>
                      <Icon className="w-4 h-4" />
                    </div>
                  )
                })}
                {room.amenities.length > 3 && (
                  <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                    +{room.amenities.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Price and CTA */}
            <div className="flex items-end justify-between">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-3xl font-black text-white drop-shadow-lg">
                  ${room.pricing.standard}
                </div>
                <div className="text-sm text-white/90 font-medium">
                  per {selectedMode === 'whole' ? 'room' : 'bed'}
                </div>
              </div>

              <motion.button
                className={`
                  px-6 py-3 rounded-xl font-semibold text-sm shadow-lg relative overflow-hidden
                  ${isSelected
                    ? 'bg-white text-orange-600 shadow-orange-200/50'
                    : 'bg-orange-500/90 text-white shadow-orange-200/30'
                  }
                  ${room.available === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={room.available === 0}
                whileHover={room.available > 0 && !isSelected ? {
                  scale: 1.05,
                  backgroundColor: "rgba(249, 115, 22, 0.95)",
                  boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4), 0 8px 10px -6px rgba(249, 115, 22, 0.1)",
                  transition: { duration: 0.2 }
                } : {}}
                whileTap={room.available > 0 ? {
                  scale: 0.95,
                  transition: { duration: 0.1 }
                } : {}}
                animate={isSelected ? {
                  backgroundColor: "#ffffff",
                  color: "#ea580c",
                  boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)"
                } : {}}
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={room.available > 0 ? {
                    x: isSelected ? "100%" : "-100%",
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }
                  } : {}}
                />

                <span className="relative z-10 flex items-center space-x-2">
                {isSelected ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                ) : (
                  <span>Select Room</span>
                )}
                </span>
              </motion.button>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1
                  }
                }}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: { delay: 0.3, type: "spring", stiffness: 400 }
                  }}
                >
                  <CheckCircleIcon className="w-6 h-6 text-white drop-shadow-lg" />
                </motion.div>

                {/* Pulsing ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-orange-300"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{
                    scale: 1.5,
                    opacity: 0,
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Bed selection overlay for per-bed rooms */}
          {selectedMode === 'perBed' && isSelected && selection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
                <h4 className="font-bold text-lg text-gray-900">Assign Participants to Beds</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: room.capacity }, (_, index) => {
                    const assignedParticipantId = selection.participantIds[index]
                    const availableParticipants = getAvailableParticipants(room.id)

                    return (
                      <select
                        key={index}
                        className="text-sm p-3 border border-gray-300 rounded-lg bg-white"
                        value={assignedParticipantId || ''}
                        onChange={(e) => handleBedAssignment(room.id, index, e.target.value || null)}
                      >
                        <option value="">Bed {index + 1} - Empty</option>
                        {availableParticipants.map((participant) => (
                          <option key={participant.id} value={participant.id}>
                            {participant.firstName} {participant.lastName}
                          </option>
                        ))}
                        {assignedParticipantId && (
                          <option value={assignedParticipantId}>
                            {getParticipantName(assignedParticipantId)} (current)
                          </option>
                        )}
                      </select>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant={selectedMode === 'whole' ? 'default' : 'outline'}
          onClick={() => setSelectedMode('whole')}
        >
          Whole Room
        </Button>
        <Button
          variant={selectedMode === 'perBed' ? 'default' : 'outline'}
          onClick={() => setSelectedMode('perBed')}
        >
          Per Bed
        </Button>
      </div>

      {/* Skip link for accessibility */}
      <a
        href="#room-selection-summary"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to room selection summary
      </a>

      {/* Room Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
        role="grid"
        aria-label="Available accommodation options"
      >
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <InfoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {selectedMode === 'whole' ? 'whole rooms' : 'per-bed options'} available
              </h3>
              <p className="text-gray-600">
                Try selecting a different accommodation type.
              </p>
            </div>
          </div>
        ) : (
          filteredRooms.map(renderRoomCard)
        )}
      </div>

      {/* Selection Summary */}
      {selectedRooms.length > 0 && (
        <motion.div
          id="room-selection-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-oceanBlue-50 border border-oceanBlue-200 rounded-lg p-4"
          role="region"
          aria-labelledby="selection-summary-heading"
        >
          <h3 id="selection-summary-heading" className="font-semibold text-oceanBlue-900 mb-2">Selected Accommodation:</h3>
          <div className="space-y-2">
            {selectedRooms.map((selection) => {
              const room = rooms.find(r => r.id === selection.roomId)
              if (!room) return null

              return (
                <div key={selection.roomId} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{room.name}</span>
                  <div className="flex items-center space-x-2">
                    {selection.type === 'perBed' && (
                      <span className="text-gray-600">
                        {selection.participantIds.filter(id => id).length}/{room.capacity} beds assigned
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      ${selection.type === 'whole' ? room.pricing.standard : room.pricing.camp.perBed}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

