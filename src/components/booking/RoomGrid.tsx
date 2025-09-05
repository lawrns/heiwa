'use client'

import { useState, useMemo } from 'react'
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
  name: string
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
    return participant ? participant.name : 'Unknown'
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
    const occupancyRate = ((room.totalSpots - room.available) / room.totalSpots) * 100

    return (
      <motion.div
        key={room.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'ring-2 ring-oceanBlue-500 shadow-lg'
            : 'hover:shadow-md'
        } ${room.available === 0 ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <div className="flex items-center space-x-2">
                {room.available > 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircleIcon className="w-3 h-3 mr-1" />
                    Full
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-4 h-4" />
                <span>Capacity: {room.capacity}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BedIcon className="w-4 h-4" />
                <span>{room.available}/{room.totalSpots} available</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${room.pricing.standard}
                </div>
                <div className="text-sm text-gray-600">per {selectedMode === 'whole' ? 'room' : 'bed'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Occupancy</div>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-oceanBlue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenityId) => {
                const amenity = AVAILABLE_AMENITIES[amenityId as keyof typeof AVAILABLE_AMENITIES]
                if (!amenity) return null

                const Icon = amenity.icon
                return (
                  <TooltipProvider key={amenityId}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {amenity.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{amenity.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
              {room.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{room.amenities.length - 4} more
                </Badge>
              )}
            </div>

            {/* Bed selection for per-bed rooms */}
            {selectedMode === 'perBed' && isSelected && selection && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-sm">Assign Participants to Beds:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: room.capacity }, (_, index) => {
                    const assignedParticipantId = selection.participantIds[index]
                    const availableParticipants = getAvailableParticipants(room.id)

                    return (
                      <select
                        key={index}
                        className="text-xs p-2 border rounded"
                        value={assignedParticipantId || ''}
                        onChange={(e) => handleBedAssignment(room.id, index, e.target.value || null)}
                      >
                        <option value="">Bed {index + 1} - Empty</option>
                        {availableParticipants.map((participant) => (
                          <option key={participant.id} value={participant.id}>
                            {participant.name}
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
            )}

            {/* Select Button */}
            <Button
              className="w-full"
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleRoomSelect(room)}
              disabled={room.available === 0}
            >
              {isSelected ? 'Selected' : 'Select Room'}
            </Button>
          </CardContent>
        </Card>
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

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <InfoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {selectedMode === 'whole' ? 'whole rooms' : 'per-bed options'} available
            </h3>
            <p className="text-gray-600">
              Try selecting a different accommodation type.
            </p>
          </div>
        ) : (
          filteredRooms.map(renderRoomCard)
        )}
      </div>

      {/* Selection Summary */}
      {selectedRooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-oceanBlue-50 border border-oceanBlue-200 rounded-lg p-4"
        >
          <h3 className="font-semibold text-oceanBlue-900 mb-2">Selected Accommodation:</h3>
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
