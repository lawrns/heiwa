"use client"

// CMS Admin Dashboard
// Main dashboard for content management

import React from 'react'
import { HomepageEditor, MediaLibrary } from '@/components/admin'
import { AdminButton } from '@/components/admin/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Layout, 
  Image, 
  MessageSquare, 
  HelpCircle, 
  MousePointer,
  BarChart3
} from 'lucide-react'

const CMSDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Manage your website content, media, and settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Homepage Sections"
          value="8"
          change="+2 this week"
          icon={Layout}
          color="orange"
        />
        <StatCard
          title="Media Files"
          value="24"
          change="+5 this week"
          icon={Image}
          color="blue"
        />
        <StatCard
          title="Testimonials"
          value="12"
          change="+1 this week"
          icon={MessageSquare}
          color="green"
        />
        <StatCard
          title="FAQ Items"
          value="15"
          change="No change"
          icon={HelpCircle}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1">
          <TabsTrigger value="homepage" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <Layout className="w-4 h-4" />
            Homepage
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <MousePointer className="w-4 h-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <Image className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <MessageSquare className="w-4 h-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homepage">
          <HomepageEditor />
        </TabsContent>

        <TabsContent value="pages">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Page Content Editor</h3>
            <p className="text-gray-600 mb-4">Manage content for Flow, Play, Surf, and The Spot pages</p>
            <AdminButton variant="outline">Coming Soon</AdminButton>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Testimonials Manager</h3>
            <p className="text-gray-600 mb-4">Manage guest reviews and testimonials</p>
            <AdminButton variant="outline">Coming Soon</AdminButton>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ Manager</h3>
            <p className="text-gray-600 mb-4">Manage frequently asked questions</p>
            <AdminButton variant="outline">Coming Soon</AdminButton>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-4">View content performance and usage statistics</p>
            <AdminButton variant="outline">Coming Soon</AdminButton>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: 'orange' | 'blue' | 'green' | 'purple'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`rounded-lg border p-6 ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs mt-2 opacity-70">{change}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  )
}

export default CMSDashboard
