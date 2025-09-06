'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileTextIcon, DownloadIcon, TrashIcon, UserCheckIcon, ShieldIcon } from 'lucide-react'
import AuditLogViewer from '@/components/compliance/AuditLogViewer'
import DataExport from '@/components/compliance/DataExport'
import RightToErasure from '@/components/compliance/RightToErasure'
import ConsentManager from '@/components/compliance/ConsentManager'

export default function CompliancePage() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('audit')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent SSR rendering to avoid Firebase prerendering errors
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: ShieldIcon, description: 'GDPR audit trail' },
    { id: 'export', label: 'Data Export', icon: DownloadIcon, description: 'Subject access requests' },
    { id: 'erasure', label: 'Right to Erasure', icon: TrashIcon, description: 'Data deletion requests' },
    { id: 'consent', label: 'Consent Management', icon: UserCheckIcon, description: 'Privacy preferences' },
    { id: 'policy', label: 'Privacy Policy', icon: FileTextIcon, description: 'Policy management' }
  ]

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <FileTextIcon className="w-8 h-8 text-oceanBlue-600 mr-3" />
          GDPR Compliance
        </h1>
        <p className="text-gray-600">
          Comprehensive GDPR compliance tools and audit trails for Heiwa House
        </p>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800">Compliance Status</CardTitle>
              <ShieldIcon className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">GDPR Ready</div>
            <p className="text-xs text-green-600 mt-1">
              All systems compliant
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Active Consents</CardTitle>
              <UserCheckIcon className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">89%</div>
            <p className="text-xs text-blue-600 mt-1">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">127/142 clients</Badge>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800">Data Exports</CardTitle>
              <DownloadIcon className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">3</div>
            <p className="text-xs text-purple-600 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-800">Audit Events</CardTitle>
              <FileTextIcon className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">1,247</div>
            <p className="text-xs text-orange-600 mt-1">
              Total logged events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-oceanBlue-500 text-oceanBlue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'export' && <DataExport />}
        {activeTab === 'erasure' && <RightToErasure />}
        {activeTab === 'consent' && <ConsentManager />}
        {activeTab === 'policy' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Privacy Policy Management</CardTitle>
              <CardDescription>
                Manage and track privacy policy updates and admin confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Current Privacy Policy</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Last updated: January 15, 2024<br />
                    Version: 2.1<br />
                    Next review: January 15, 2025
                  </p>
                  <div className="flex space-x-2">
                    <button className="text-oceanBlue-600 hover:text-oceanBlue-700 text-sm underline">
                      View Full Policy
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 text-sm underline">
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Admin Confirmations</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    All administrators must confirm they&apos;ve read and understood the latest privacy policy.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-green-100 text-green-800">3/3 Confirmed</Badge>
                    <span className="text-sm text-gray-600">Last confirmation: 2 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

