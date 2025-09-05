'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldIcon, UsersIcon, DatabaseIcon, SettingsIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react'
import AdminUsers from '@/components/system/AdminUsers'
import SystemHealth from '@/components/system/SystemHealth'
import BackupManager from '@/components/system/BackupManager'
import IntegrationManager from '@/components/system/IntegrationManager'
import AuditLogs from '@/components/system/AuditLogs'

export default function SystemPage() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent SSR rendering to avoid Firebase prerendering errors
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system administration...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldIcon },
    { id: 'users', label: 'Admin Users', icon: UsersIcon },
    { id: 'health', label: 'System Health', icon: DatabaseIcon },
    { id: 'backup', label: 'Backup & Restore', icon: SettingsIcon },
    { id: 'integrations', label: 'Integrations', icon: SettingsIcon },
    { id: 'logs', label: 'Audit Logs', icon: AlertTriangleIcon }
  ]

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <ShieldIcon className="w-8 h-8 text-oceanBlue-600 mr-3" />
          System Administration
        </h1>
        <p className="text-gray-600">
          Enterprise-ready system management and monitoring for Heiwa House
        </p>
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
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Status Overview */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-800">System Status</CardTitle>
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">Healthy</div>
                <p className="text-xs text-green-600 mt-1">
                  All services operational
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-800">Active Admins</CardTitle>
                  <UsersIcon className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">3</div>
                <p className="text-xs text-blue-600 mt-1">
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">1 Superadmin</Badge>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-800">Last Backup</CardTitle>
                  <DatabaseIcon className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">2h ago</div>
                <p className="text-xs text-purple-600 mt-1">
                  Automated daily backup
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-orange-800">Security Events</CardTitle>
                  <AlertTriangleIcon className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">0</div>
                <p className="text-xs text-orange-600 mt-1">
                  No security incidents
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-teal-800">Integrations</CardTitle>
                  <SettingsIcon className="w-4 h-4 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">5/7</div>
                <p className="text-xs text-teal-600 mt-1">
                  Active integrations
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-800">Audit Logs</CardTitle>
                  <ShieldIcon className="w-4 h-4 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <p className="text-xs text-gray-600 mt-1">
                  Total logged events
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'health' && <SystemHealth />}
        {activeTab === 'backup' && <BackupManager />}
        {activeTab === 'integrations' && <IntegrationManager />}
        {activeTab === 'logs' && <AuditLogs />}
      </div>
    </div>
  )
}
