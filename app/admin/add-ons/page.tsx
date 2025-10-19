import React from 'react'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Package, Euro, Users } from 'lucide-react'

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
  // This will eventually fetch add-ons from the database
  const addOns: AddOn[] = [
    {
      id: '1',
      name: 'Surfboard Rental',
      description: 'High-quality surfboard rental for your stay',
      price: 25,
      category: 'equipment',
      isActive: true,
      maxQuantity: 10,
      requiresBooking: true
    },
    {
      id: '2',
      name: 'Airport Transfer',
      description: 'Private transfer from/to Lisbon Airport',
      price: 80,
      category: 'transport',
      isActive: true,
      maxQuantity: 1,
      requiresBooking: true
    },
    {
      id: '3',
      name: 'Photography Session',
      description: 'Professional surf photography session',
      price: 150,
      category: 'service',
      isActive: true,
      maxQuantity: 5,
      requiresBooking: true
    },
    {
      id: '4',
      name: 'Skateboard Rental',
      description: 'Skateboard rental for exploring the local skatepark',
      price: 15,
      category: 'equipment',
      isActive: false,
      maxQuantity: 8,
      requiresBooking: false
    },
    {
      id: '5',
      name: 'Yoga Class',
      description: 'Private yoga session with certified instructor',
      price: 45,
      category: 'experience',
      isActive: true,
      maxQuantity: 12,
      requiresBooking: true
    }
  ]

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add-ons Management</h1>
          <p className="text-gray-600 mt-2">Manage extra services, equipment rentals, and experiences</p>
        </div>
        <Link
          href="/admin/add-ons/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Add-on
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-accent/10 text-accent rounded-full p-3">
            <Package size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Add-ons</p>
            <p className="text-2xl font-bold text-gray-900">{addOns.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <Package size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-gray-900">{addOns.filter(a => a.isActive).length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
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
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
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
              {addOns.map((addOn) => (
                <tr key={addOn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{addOn.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{addOn.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(addOn.category)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(addOn.category)}`}>
                        {addOn.category.charAt(0).toUpperCase() + addOn.category.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{addOn.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {addOn.maxQuantity || 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      addOn.requiresBooking ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {addOn.requiresBooking ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      addOn.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {addOn.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2">
                      <Link href={`/admin/add-ons/${addOn.id}`} className="text-accent hover:text-accent-hover">
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
      <div className="bg-white rounded-lg shadow-md p-6">
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

