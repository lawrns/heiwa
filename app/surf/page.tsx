import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/page-metadata'
import SurfPageClient from './SurfPageClient'

// Revalidate every 10 seconds to pick up CMS/SEO changes quickly
export const revalidate = 10

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('surf')
}

async function getSurfSections() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    const { data, error } = await supabaseAdmin
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'surf')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (error || !data) {
      console.warn('CMS sections not available for surf, using defaults')
      return []
    }
    
    return data
  } catch (error) {
    console.warn('Error fetching surf sections:', error)
    return []
  }
}

async function getNextSurfWeek() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabaseAdmin
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today)
      .order('start_date', { ascending: true })
      .limit(1)
      .single()
    
    if (error || !data) return null
    
    return {
      id: data.id,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      price: data.price,
      images: data.images || []
    }
  } catch (error) {
    console.warn('Error fetching next surf week:', error)
    return null
  }
}

export default async function SurfPage() {
  const [sections, nextSurfWeek] = await Promise.all([
    getSurfSections(),
    getNextSurfWeek()
  ])
  
  return <SurfPageClient sections={sections} nextSurfWeek={nextSurfWeek} />
}
