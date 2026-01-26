import { Suspense } from 'react'
import {
  HomeHero,
  HomeSurfWeeks,
  HomeAbout,
  HomeRooms,
  HomeHosts,
  HomeReviews,
  HomeFacilities
} from '@/components/home/HomeSections'
import {
  SectionSkeleton,
  CardGridSkeleton,
  VideoSectionSkeleton,
  RoomsGridSkeleton,
  SurfWeeksTableSkeleton
} from '@/components/ui/cms-section-skeleton'
import { generatePageMetadata } from '@/lib/page-metadata'

// Generate SEO metadata from database
export async function generateMetadata() {
  return generatePageMetadata('homepage')
}

// Revalidate every 60 seconds to pick up CMS changes quickly
export const revalidate = 60

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <Suspense fallback={<div className="h-screen w-full bg-gray-900 animate-pulse" />}>
        <HomeHero />
      </Suspense>

      {/* Heiwa Surf Weeks Section */}
      <Suspense fallback={<SurfWeeksTableSkeleton />}>
        <HomeSurfWeeks />
      </Suspense>

      {/* What We Are About Section */}
      <Suspense fallback={<CardGridSkeleton />}>
        <HomeAbout />
      </Suspense>

      {/* Our Rooms Section */}
      <Suspense fallback={<RoomsGridSkeleton />}>
        <HomeRooms />
      </Suspense>

      {/* Your Hosts Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HomeHosts />
      </Suspense>

      {/* What Our Customers Say Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HomeReviews />
      </Suspense>

      {/* Experiences Around Section */}
      <Suspense fallback={<CardGridSkeleton count={4} />}>
        <HomeFacilities />
      </Suspense>
    </div>
  )
}
