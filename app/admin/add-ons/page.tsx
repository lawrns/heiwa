'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Package, Euro, Users, Search, Filter, Download } from 'lucide-react'

interface AddOn {
  id: string
  name: string
  description: string
  price: number
  category: 'equipment' | 'service' | 'experience' | 'transport'
  isActive: boolean
  maxQuantity?: number
  requiresBooking?: boolean
}

export default function AdminAddOnsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const categoryParam = categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''
        const response = await fetch(`/api/add-ons?include_inactive=true${categoryParam}`)
        const data = await response.json()

        if (data.success) {
          // Transform database format to component format
          const transformedAddOns = (data.addOns || []).map((addOn: any) => ({
            id: addOn.id,
            name: addOn.name,
            description: addOn.description || '',
            price: parseFloat(addOn.price) || 0,
            category: addOn.category,
            isActive: addOn.is_active !== false,
            maxQuantity: addOn.max_quantity || undefined,
            requiresBooking: addOn.max_quantity !== null && addOn.max_quantity > 0,
          }))
          setAddOns(transformedAddOns)
        } else {
          setError(data.error || 'Failed to fetch add-ons')
        }
      } catch (err) {
        console.error('Error fetching add-ons:', err)
        setError('Failed to load add-ons. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAddOns()
  }, [categoryFilter])

  const getCategoryIcon = (category: AddOn['category']) => {
    switch (category) {
      case 'equipment':
        return <Package size={16} className="text-blue-500" />
      case 'service':
        return <Users size={16} className="text-green-500" />
      case 'experience':
        return <Users size={16} className="text-purple-500" />
      case 'transport':
        return <Package size={16} className="text-orange-500" />
      default:
        return <Package size={16} className="text-gray-500" />
    }
  }

  const getCategoryColor = (category: AddOn['category']) => {
    switch (category) {
      case 'equipment':
        return 'bg-blue-100 text-blue-800'
      case 'service':
        return 'bg-green-100 text-green-800'
      case 'experience':
        return 'bg-purple-100 text-purple-800'
      case 'transport':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter add-ons
  const filteredAddOns = addOns.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || addon.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add-ons Management</h1>
          <p className="text-gray-600 mt-2">Manage extra services, equipment rentals, and experiences</p>
        </div>
        <Link
          href="/admin/add-ons/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-heiwaOrange-600 hover:bg-heiwaOrange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-heiwaOrange-500"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Add-on
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
                placeholder="Search add-ons by name..."
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
            <option value="equipment">Equipment</option>
            <option value="service">Service</option>
            <option value="experience">Experience</option>
            <option value="transport">Transport</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border border-gray-200">
          <div className="flex-shrink-0 bg-heiwaOrange-100 text-heiwaOrange-600 rounded-full p-3">
            <Package size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Add-ons</p>
            <p className="text-2xl font-bold text-gray-900">{addOns.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <Package size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-gray-900">{addOns.filter(a => a.isActive).length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <Euro size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Price</p>
            <p className="text-2xl font-bold text-gray-900">
              €{Math.round(addOns.reduce((sum, addon) => sum + addon.price, 0) / addOns.length)}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-purple-100 text-purple-600 rounded-full p-3">
            <Users size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Requires Booking</p>
            <p className="text-2xl font-bold text-gray-900">{addOns.filter(a => a.requiresBooking).length}</p>
          </div>
        </div>
      </div>

      {/* Add-ons Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Add-ons</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Required
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAddOns.map((addOn) => (
                <tr key={addOn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{addOn.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{addOn.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(addOn.category)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(addOn.category)}`}>
                        {addOn.category.charAt(0).toUpperCase() + addOn.category.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    €{addOn.price}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {addOn.maxQuantity || 'Unlimited'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      addOn.requiresBooking ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {addOn.requiresBooking ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      addOn.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {addOn.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2">
                      <Link href={`/admin/add-ons/${addOn.id}`} className="text-heiwaOrange-600 hover:text-heiwaOrange-700">
                        <Edit className="h-5 w-5 inline-block" />
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5 inline-block" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['equipment', 'service', 'experience', 'transport'].map(category => {
            const categoryAddOns = addOns.filter(a => a.category === category)
            return (
              <div key={category} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getCategoryIcon(category as AddOn['category'])}
                </div>
                <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                <p className="text-sm text-gray-500">{categoryAddOns.length} items</p>
                <p className="text-xs text-gray-400">
                  €{categoryAddOns.length > 0 ? Math.round(categoryAddOns.reduce((sum, a) => sum + a.price, 0) / categoryAddOns.length) : 0} avg
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

