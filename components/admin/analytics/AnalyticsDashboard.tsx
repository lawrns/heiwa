'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, FileText, MessageSquare, HelpCircle, Image, Users, Star, Calendar, Layout } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminAlert from '@/components/admin/ui/AdminAlert'

interface AnalyticsData {
  contentCounts: {
    homepageSections: number
    pageContent: number
    testimonials: number
    faqItems: number
    mediaLibrary: number
  }
  pageStats: Record<string, number>
  ratingStats: Record<string, number>
  faqStats: Record<string, number>
}

interface ContentAnalytics {
  recentActivity: any[]
  typeStats: Record<string, number>
}

interface TestimonialAnalytics {
  totalTestimonials: number
  featuredTestimonials: number
  averageRating: string
  recentTestimonials: number
}

export function AnalyticsDashboard() {
  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null)
  const [contentData, setContentData] = useState<ContentAnalytics | null>(null)
  const [testimonialData, setTestimonialData] = useState<TestimonialAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'testimonials'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [activeTab])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/analytics?type=${activeTab}`)
      const data = await response.json()
      
      if (data.success) {
        switch (activeTab) {
          case 'overview':
            setOverviewData(data.data)
            break
          case 'content':
            setContentData(data.data)
            break
          case 'testimonials':
            setTestimonialData(data.data)
            break
        }
      } else {
        setError(data.error || 'Failed to fetch analytics data')
      }
    } catch (err) {
      setError('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">View content performance and usage statistics</p>
        </div>
        <AdminButton onClick={fetchAnalytics} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Refresh Data
        </AdminButton>
      </div>

      {/* Error Message */}
      {error && (
        <AdminAlert variant="error">
          {error}
        </AdminAlert>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Analytics
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Testimonials
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overviewData && (
        <div className="space-y-8">
          {/* Content Overview Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Homepage Sections"
                value={overviewData.contentCounts.homepageSections}
                icon={Layout}
                color="blue"
              />
              <StatCard
                title="Page Content"
                value={overviewData.contentCounts.pageContent}
                icon={FileText}
                color="green"
              />
              <StatCard
                title="Testimonials"
                value={overviewData.contentCounts.testimonials}
                icon={MessageSquare}
                color="purple"
              />
              <StatCard
                title="FAQ Items"
                value={overviewData.contentCounts.faqItems}
                icon={HelpCircle}
                color="orange"
              />
            </div>
          </div>

          {/* Page Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content by Page</h3>
              <div className="space-y-3">
                {Object.entries(overviewData.pageStats).map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {page.replace('-', ' ')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(overviewData.pageStats))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">FAQ by Category</h3>
              <div className="space-y-3">
                {Object.entries(overviewData.faqStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(overviewData.faqStats))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial Ratings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Testimonial Ratings</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = overviewData.ratingStats[rating] || 0
                const total = Object.values(overviewData.ratingStats).reduce((sum, val) => sum + val, 0)
                const percentage = total > 0 ? (count / total) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        {rating}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content Analytics Tab */}
      {activeTab === 'content' && contentData && (
        <div className="space-y-8">
          {/* Content Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content by Type</h3>
            <div className="space-y-3">
              {Object.entries(contentData.typeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(contentData.typeStats))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {contentData.recentActivity?.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action || 'Content updated'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activity.entity_type || 'Unknown'}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Analytics Tab */}
      {activeTab === 'testimonials' && testimonialData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Testimonials"
              value={testimonialData.totalTestimonials}
              icon={MessageSquare}
              color="purple"
            />
            <StatCard
              title="Featured"
              value={testimonialData.featuredTestimonials}
              icon={Star}
              color="yellow"
            />
            <StatCard
              title="Average Rating"
              value={testimonialData.averageRating}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Last 30 Days"
              value={testimonialData.recentTestimonials}
              icon={Calendar}
              color="blue"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Testimonial Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Featured Rate</h4>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-yellow-400 h-3 rounded-full" 
                      style={{ 
                        width: `${testimonialData.totalTestimonials > 0 
                          ? (testimonialData.featuredTestimonials / testimonialData.totalTestimonials) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900">
                    {testimonialData.totalTestimonials > 0 
                      ? Math.round((testimonialData.featuredTestimonials / testimonialData.totalTestimonials) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Growth</h4>
                <div className="flex items-center">
                  {testimonialData.recentTestimonials > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-600">
                        +{testimonialData.recentTestimonials} this month
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        No new testimonials this month
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
