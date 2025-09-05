'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, UsersIcon, MapPinIcon } from 'lucide-react'
import AssignmentBoard from '@/components/admin/assignments/AssignmentBoard'

interface Assignment {
  roomId: string
  participantIds: string[]
}

export default function AdminAssignmentsPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>('week-1')
  const [assignments, setAssignments] = useState<Assignment[]>([])

  // Mock week data
  const weeks = [
    { id: 'week-1', name: 'March 15-22, 2024', category: 'Heiwa', participants: 8, rooms: 6 },
    { id: 'week-2', name: 'March 22-29, 2024', category: 'Freedom Routes', participants: 6, rooms: 4 },
    { id: 'week-3', name: 'April 1-8, 2024', category: 'Heiwa', participants: 10, rooms: 7 }
  ]

  const selectedWeekData = weeks.find(w => w.id === selectedWeek)

  const handleSaveAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments)
    console.log('Assignments saved for week:', selectedWeek, newAssignments)
    // In a real app, this would save to Firestore
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
              <CalendarIcon className="w-8 h-8 text-blue-600" />
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
