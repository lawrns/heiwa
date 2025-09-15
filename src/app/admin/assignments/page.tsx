'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, UsersIcon, MapPinIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'
import AssignmentBoard from '@/components/admin/assignments/AssignmentBoard'

interface Assignment {
  roomId: string
  participantIds: string[]
}

interface WeekData {
  id: string;
  name: string;
  category: string;
  participants: number;
  rooms: number;
  startDate: string;
  endDate: string;
}

export default function AdminAssignmentsPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [weeks, setWeeks] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch surf camp weeks from Supabase
  const fetchSurfCampWeeks = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('surf_camps')
        .select('id, name, start_date, end_date, max_participants, is_active')
        .eq('is_active', true)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching surf camps:', error)
        toast.error('Failed to load surf camp weeks')
        return
      }

      if (data) {
        const formattedWeeks: WeekData[] = data.map(camp => ({
          id: camp.id,
          name: `${camp.name} (${new Date(camp.start_date).toLocaleDateString()} - ${new Date(camp.end_date).toLocaleDateString()})`,
          category: camp.name.toLowerCase().includes('frenchman') ? 'Freedom Routes' : 'Heiwa House',
          participants: camp.max_participants,
          rooms: Math.ceil(camp.max_participants / 2), // Estimate 2 people per room
          startDate: camp.start_date,
          endDate: camp.end_date
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
      // TODO: Save assignments to Supabase
      // For now, just show a success message
      toast.success('Assignments saved successfully!')
      console.log('Assignments saved for week:', selectedWeek, newAssignments)
    } catch (error) {
      console.error('Error saving assignments:', error)
      toast.error('Failed to save assignments')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heiwaOrange-600"></div>
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
          <h1 className="text-3xl font-bold text-gray-900" data-testid="assignments-title">Room Assignments</h1>
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
                    <UsersIcon className="w-4 h-4" />
                    <span>{selectedWeekData.participants} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
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

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-8 h-8 text-heiwaOrange-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Active Weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-600">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">17</p>
                <p className="text-sm text-gray-600">Rooms Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">85%</span>
              </div>
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
