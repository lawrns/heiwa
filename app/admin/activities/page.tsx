'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Play, Heart, Waves, Bike, Dumbbell, Thermometer, Wind, Droplets, Users, MapPin, Search, Download } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description?: string
  image_url: string
  category: string
  icon?: string
  availability_tier: 'always' | 'on-request'
  display_order: number
  active: boolean
  hero_video_url?: string
  hero_image_url?: string
  features?: string[]
}

const iconMap: Record<string, any> = {
  play: Play,
  flow: Heart,
  surf: Waves,
  bike: Bike,
  dumbbell: Dumbbell,
  thermometer: Thermometer,
  wind: Wind,
  droplets: Droplets,
  users: Users,
  'map-pin': MapPin,
}

const categoryColors: Record<string, string> = {
  play: 'bg-blue-100 text-blue-800',
  flow: 'bg-purple-100 text-purple-800',
  surf: 'bg-cyan-100 text-cyan-800',
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      const result = await response.json()
      
      if (result.success) {
        setActivities(result.data)
      } else {
        setError(result.error)
      }
    } catch {
      setError('Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const toggleActivityStatus = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active })
      })
      
      if (response.ok) {
        fetchActivities()
      }
    } catch (err) {
      console.error('Failed to toggle activity status:', err)
    }
  }

  const deleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return
    
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchActivities()
      }
    } catch (err) {
      console.error('Failed to delete activity:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-2">Manage activities for Play, Flow, and Surf experiences</p>
        </div>
        <Link
          href="/admin/activities/new"
          className="inline-flex items-center gap-2 bg-heiwaOrange-600 hover:bg-heiwaOrange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="play">Play</option>
            <option value="flow">Flow</option>
            <option value="surf">Surf</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => {
                const IconComponent = iconMap[activity.icon || 'play']
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {activity.display_order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {IconComponent && <IconComponent className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </div>
                          {activity.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {activity.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[activity.category] || 'bg-gray-100 text-gray-800'}`}>
                        {activity.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.availability_tier === 'always' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.availability_tier === 'always' ? 'Always Available' : 'On Request'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActivityStatus(activity.id, activity.active)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {activity.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {activity.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/activities/${activity.id}`}
                          className="text-heiwaOrange-600 hover:text-heiwaOrange-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== 'all' ? 'No activities match your search or filters.' : 'No activities found'}
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Link
                href="/admin/activities/new"
                className="inline-flex items-center gap-2 mt-4 text-heiwaOrange-600 hover:text-heiwaOrange-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add your first activity
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
