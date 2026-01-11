'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Button import removed - not currently used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin } from 'lucide-react'
import { toast } from 'react-toastify'
import AssignmentBoard from '@/components/admin/assignments/AssignmentBoard'
import { formatDateShort } from '@/lib/utils'

interface Assignment {
  roomId: string
  participantIds: string[]
}

interface WeekData {
  id: string
  name: string
  category: string
  participants: number
  rooms: number
  startDate: string
  endDate: string
  assignments: Assignment[]
}

interface CampApiResponse {
  id: string
  name: string
  start_date: string
  end_date: string
  max_participants?: number
}

export default function AdminAssignmentsPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>('')
  const [, setAssignments] = useState<Assignment[]>([])
  const [weeks, setWeeks] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch surf camp weeks from Supabase
  const fetchSurfCampWeeks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/surf-camps', { method: 'GET' })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.success) {
        console.error('Error fetching surf camps:', result?.error || response.statusText)
        toast.error('Failed to load surf camp weeks')
        return
      }

      const camps: CampApiResponse[] = result?.data?.surf_camps || []
      if (camps) {
        const formattedWeeks: WeekData[] = camps.map((camp: CampApiResponse) => ({
          id: camp.id,
          name: `${camp.name} (${formatDateShort(camp.start_date)} - ${formatDateShort(camp.end_date)})`,
          category: camp.name.toLowerCase().includes('frenchman') ? 'Freedom Routes' : 'Heiwa House',
          participants: camp.max_participants || 0,
          rooms: Math.ceil((camp.max_participants || 0) / 2),
          startDate: camp.start_date,
          endDate: camp.end_date,
          assignments: []
        }))

        setWeeks(formattedWeeks)
        if (formattedWeeks.length > 0 && !selectedWeek) {
          setSelectedWeek(formattedWeeks[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching surf camps:', error)
      toast.error('Failed to load surf camp weeks')
    } finally {
      setLoading(false)
    }
  }, [selectedWeek])

  useEffect(() => {
    fetchSurfCampWeeks()
  }, [fetchSurfCampWeeks])

  const selectedWeekData = weeks.find(w => w.id === selectedWeek)

  const handleSaveAssignments = async (newAssignments: Assignment[]) => {
    try {
      setAssignments(newAssignments)
      toast.success('Assignments saved successfully!')
    } catch (error) {
      console.error('Error saving assignments:', error)
      toast.error('Failed to save assignments')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Assignments</h1>
          <p className="text-gray-600">Assign participants to rooms for surf camp weeks</p>
        </div>
      </motion.div>

      {/* Week Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Select Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((week) => (
                    <SelectItem key={week.id} value={week.id}>
                      {week.name} - {week.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedWeekData && (
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedWeekData.participants} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedWeekData.rooms} rooms</span>
                  </div>
                  <Badge className="ml-2">
                    {selectedWeekData.category}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assignment Board */}
      {selectedWeek && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AssignmentBoard
            weekId={selectedWeek}
            onSave={handleSaveAssignments}
          />
        </motion.div>
      )}

      {weeks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No active surf camps found. Create a surf camp first to assign rooms.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


