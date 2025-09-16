'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  UsersIcon,
  BedIcon,
  MapPinIcon,
  SaveIcon,
  RotateCcw as RefreshIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  email: string
  surfLevel: string
  bookingId: string
}

interface Room {
  id: string
  name: string
  capacity: number
  type: 'private' | 'dorm'
  currentOccupancy: number
  amenities: string[]
}

interface Assignment {
  roomId: string
  participantIds: string[]
}

interface AssignmentBoardProps {
  weekId: string
  onSave: (assignments: Assignment[]) => void
}

// Drag and drop item types
const ItemTypes = {
  PARTICIPANT: 'participant'
}

// Draggable participant component
interface DraggableParticipantProps {
  participant: Participant
}

const DraggableParticipant: React.FC<DraggableParticipantProps> = memo(({ participant }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PARTICIPANT,
    item: () => ({ type: ItemTypes.PARTICIPANT, id: participant.id }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => true,
  }), [participant.id]);

  return (
    <div
      ref={drag as any}
      className={`p-3 bg-white border rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'
      }`}
      data-testid={`participant-card-${participant.id}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-center space-x-2">
        <UsersIcon className="w-4 h-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{participant.name}</p>
          <p className="text-xs text-gray-500 truncate">{participant.email}</p>
        </div>
        <Badge className="text-xs bg-heiwaOrange-600 text-white hover:bg-heiwaOrange-700">
          {participant.surfLevel}
        </Badge>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return prevProps.participant.id === nextProps.participant.id &&
         prevProps.participant.name === nextProps.participant.name &&
         prevProps.participant.email === nextProps.participant.email &&
         prevProps.participant.surfLevel === nextProps.participant.surfLevel;
})

// Droppable room component
interface DroppableRoomProps {
  room: Room
  assignedParticipants: Participant[]
  onDrop: (participantId: string) => void
  onRemove: (participantId: string) => void
}

const DroppableRoom: React.FC<DroppableRoomProps> = memo(({
  room,
  assignedParticipants,
  onDrop,
  onRemove
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PARTICIPANT,
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: () => true,
  }), [onDrop]);

  const occupancyRate = (assignedParticipants.length / room.capacity) * 100
  const isFull = assignedParticipants.length >= room.capacity
  const isOverCapacity = assignedParticipants.length > room.capacity

  return (
    <motion.div
      ref={drop as any}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-all ${
        isOver
          ? 'border-heiwaOrange-400 bg-heiwaOrange-50'
          : isFull
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      data-testid={`room-zone-${room.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">{room.name}</h3>
          <Badge className="bg-heiwaOrange-600 text-white hover:bg-heiwaOrange-700">
            {room.type}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <UsersIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600" data-testid={`occupancy-${room.id}`}>
            {assignedParticipants.length}/{room.capacity}
          </span>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Occupancy</span>
          <span>{Math.round(occupancyRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverCapacity ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Assigned participants */}
      <div className="space-y-2">
        {assignedParticipants.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Drop participants here
          </p>
        ) : (
          assignedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-gray-500">{participant.surfLevel}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(participant.id)}
                className="text-red-600 hover:text-red-700"
                data-testid={`remove-participant-${participant.id}`}
              >
                ×
              </Button>
            </div>
          ))
        )}
      </div>

      {isOverCapacity && (
        <div className="mt-2 flex items-center space-x-1 text-red-600 text-xs">
          <AlertCircleIcon className="w-3 h-3" />
          <span>Over capacity!</span>
        </div>
      )}
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return prevProps.room.id === nextProps.room.id &&
         prevProps.assignedParticipants.length === nextProps.assignedParticipants.length &&
         prevProps.assignedParticipants.every((p, i) => p.id === nextProps.assignedParticipants[i]?.id) &&
         prevProps.onDrop === nextProps.onDrop &&
         prevProps.onRemove === nextProps.onRemove;
})

export default function AssignmentBoard({ weekId, onSave }: AssignmentBoardProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch participants for the selected week
        const participantsResponse = await fetch(`/api/assignments/participants?weekId=${weekId}`)
        const participantsData = await participantsResponse.json()

        // Fetch actual rooms from the database
        const roomsResponse = await fetch('/api/rooms')
        const roomsData = await roomsResponse.json()

        // Transform room data to match our interface
        const roomsArray = roomsData.rooms || []
        const transformedRooms: Room[] = roomsArray.map((room: any) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          type: room.bookingType === 'perBed' ? 'dorm' : 'private',
          currentOccupancy: 0, // Will be calculated from assignments
          amenities: room.amenities || []
        }))

        // Fetch existing assignments
        const assignmentsResponse = await fetch(`/api/assignments?weekId=${weekId}`)
        const assignmentsData = await assignmentsResponse.json()

        setParticipants(participantsData || [])
        setRooms(transformedRooms)
        setAssignments(assignmentsData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching assignment data:', error)
        // No fallback - show error state instead of mock data
        setParticipants([])
        setRooms([])
        setAssignments([])
        setLoading(false)
      }
    }

    if (weekId) {
      fetchData()
    }
  }, [weekId])

  const handleParticipantDrop = useCallback((roomId: string, participantId: string) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.roomId === roomId)
      if (existing) {
        // Check if participant is already assigned to this room
        if (existing.participantIds.includes(participantId)) {
          return prev
        }
        // Remove from other rooms first
        const updated = prev.map(a =>
          a.roomId === roomId
            ? { ...a, participantIds: [...a.participantIds, participantId] }
            : { ...a, participantIds: a.participantIds.filter(id => id !== participantId) }
        )
        return updated
      } else {
        // Create new assignment
        const newAssignment: Assignment = {
          roomId,
          participantIds: [participantId]
        }
        return [...prev.filter(a => a.participantIds.length > 0), newAssignment]
      }
    })
  }, [])

  const handleParticipantRemove = useCallback((roomId: string, participantId: string) => {
    setAssignments(prev =>
      prev.map(a =>
        a.roomId === roomId
          ? { ...a, participantIds: a.participantIds.filter(id => id !== participantId) }
          : a
      ).filter(a => a.participantIds.length > 0)
    )
  }, [])

  const getAssignedParticipants = useCallback((roomId: string) => {
    const assignment = assignments.find(a => a.roomId === roomId)
    if (!assignment) return []

    return assignment.participantIds.map(id =>
      participants.find(p => p.id === id)
    ).filter(Boolean) as Participant[]
  }, [assignments, participants])

  const unassignedParticipants = useMemo(() => {
    const assignedIds = assignments.flatMap(a => a.participantIds)
    return participants.filter(p => !assignedIds.includes(p.id))
  }, [assignments, participants])

  // Create stable callback maps
  const dropHandlers = useMemo(() => {
    const handlers = new Map<string, (participantId: string) => void>()
    rooms.forEach(room => {
      handlers.set(room.id, (participantId: string) => handleParticipantDrop(room.id, participantId))
    })
    return handlers
  }, [rooms, handleParticipantDrop])

  const removeHandlers = useMemo(() => {
    const handlers = new Map<string, (participantId: string) => void>()
    rooms.forEach(room => {
      handlers.set(room.id, (participantId: string) => handleParticipantRemove(room.id, participantId))
    })
    return handlers
  }, [rooms, handleParticipantRemove])

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSave(assignments)
      console.log('Assignments saved:', assignments)
    } catch (error) {
      console.error('Error saving assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heiwaOrange-600"></div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="assignment-board-title">Room Assignments</h2>
            <p className="text-gray-600">Drag participants to assign them to rooms for Week {weekId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" data-testid="refresh-assignments-button">
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="save-assignments-button">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              Save Assignments
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="occupancy-stats">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5 text-heiwaOrange-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="total-participants-1">{participants.length}</p>
                  <p className="text-sm text-gray-600">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BedIcon className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="rooms-assigned-count">{assignments.length}</p>
                  <p className="text-sm text-gray-600">Rooms Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold" data-testid="unassigned-count">{unassignedParticipants.length}</p>
                  <p className="text-sm text-gray-600">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned Participants */}
          <div className="lg:col-span-1">
            <Card data-testid="unassigned-participants-card">
              <CardHeader>
                <CardTitle className="text-lg">Unassigned Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unassignedParticipants.map((participant) => (
                    <DraggableParticipant
                      key={`unassigned-${participant.id}`}
                      participant={participant}
                    />
                  ))}
                  {unassignedParticipants.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      All participants assigned!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rooms */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <DroppableRoom
                  key={room.id}
                  room={room}
                  assignedParticipants={getAssignedParticipants(room.id)}
                  onDrop={dropHandlers.get(room.id)!}
                  onRemove={removeHandlers.get(room.id)!}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
