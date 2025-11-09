import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    let data: any = {}

    switch (type) {
      case 'overview':
        // Get content counts
        const [
          { count: homepageSectionsCount },
          { count: pageContentCount },
          { count: testimonialsCount },
          { count: faqItemsCount },
          { count: mediaLibraryCount }
        ] = await Promise.all([
          supabaseAdmin.from('homepage_sections').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('page_content').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('faq_items').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('media_library').select('*', { count: 'exact', head: true })
        ])

        // Get page content by page
        const { data: pageContentByPage } = await supabaseAdmin
          .from('page_content')
          .select('page_slug')
          .order('page_slug')

        const pageStats = pageContentByPage?.reduce((acc: any, item: any) => {
          acc[item.page_slug] = (acc[item.page_slug] || 0) + 1
          return acc
        }, {})

        // Get testimonials by rating
        const { data: testimonialsByRating } = await supabaseAdmin
          .from('testimonials')
          .select('rating')

        const ratingStats = (testimonialsByRating as any[])?.reduce((acc: any, item: any) => {
          acc[item.rating] = (acc[item.rating] || 0) + 1
          return acc
        }, {})

        // Get FAQ by category
        const { data: faqByCategory } = await supabaseAdmin
          .from('faq_items')
          .select('category')

        const faqStats = (faqByCategory as any[])?.reduce((acc: any, item: any) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {})

        data = {
          contentCounts: {
            homepageSections: homepageSectionsCount || 0,
            pageContent: pageContentCount || 0,
            testimonials: testimonialsCount || 0,
            faqItems: faqItemsCount || 0,
            mediaLibrary: mediaLibraryCount || 0
          },
          pageStats: pageStats || {},
          ratingStats: ratingStats || {},
          faqStats: faqStats || {}
        }
        break

      case 'content':
        // Get recent activity
        const { data: recentActivity } = await supabaseAdmin
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        // Get content by type
        const { data: contentByType } = await supabaseAdmin
          .from('page_content')
          .select('section_type')

        const typeStats = (contentByType as any[])?.reduce((acc: any, item: any) => {
          acc[item.section_type] = (acc[item.section_type] || 0) + 1
          return acc
        }, {})

        data = {
          recentActivity,
          typeStats
        }
        break

      case 'testimonials':
        // Get testimonials stats
        const { data: testimonialStats } = await supabaseAdmin
          .from('testimonials')
          .select('rating, is_featured, created_at')

        const totalTestimonials = (testimonialStats as any[])?.length || 0
        const featuredTestimonials = (testimonialStats as any[])?.filter((t: any) => t.is_featured).length || 0
        const averageRating = (testimonialStats as any[])?.reduce((sum: number, t: any) => sum + t.rating, 0) / totalTestimonials || 0

        // Recent testimonials
        const recentTestimonials = (testimonialStats as any[])?.filter((t: any) => {
          const createdAt = new Date(t.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return createdAt > thirtyDaysAgo
        }).length || 0

        data = {
          totalTestimonials,
          featuredTestimonials,
          averageRating: averageRating.toFixed(1),
          recentTestimonials
        }
        break

      case 'dashboard':
        // Get real dashboard statistics from database
        const [
          { count: totalRooms },
          { count: activeBookings },
          { count: totalGuests },
          { data: revenueData },
          { data: recentBookingsData }
        ] = await Promise.all([
          supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).in('payment_status', ['confirmed', 'pending']),
          supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('bookings').select('total_amount').in('payment_status', ['confirmed']),
          supabaseAdmin.from('bookings').select(`
            id,
            clients!inner(name),
            rooms!inner(name),
            check_in_date,
            payment_status
          `).order('created_at', { ascending: false }).limit(5)
        ])

        // Calculate total revenue
        const totalRevenue = (revenueData as any[])?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

        // Format recent bookings
        const formattedBookings = (recentBookingsData as any[])?.map(booking => ({
          id: booking.id,
          guest: booking.clients?.name || 'Unknown',
          room: booking.rooms?.name || 'Unknown',
          checkIn: new Date(booking.check_in_date).toISOString().split('T')[0],
          status: booking.payment_status || 'pending'
        })) || []

        data = {
          stats: [
            { name: 'Total Rooms', value: totalRooms?.toString() || '0', icon: 'Bed', change: '+0', changeType: 'positive' },
            { name: 'Active Bookings', value: activeBookings?.toString() || '0', icon: 'Calendar', change: '+0%', changeType: 'positive' },
            { name: 'Total Guests', value: totalGuests?.toString() || '0', icon: 'Users', change: '+0%', changeType: 'positive' },
            { name: 'Revenue', value: `€${totalRevenue.toLocaleString()}`, icon: 'TrendingUp', change: '+0%', changeType: 'positive' }
          ],
          recentBookings: formattedBookings
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
