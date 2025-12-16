/**
 * CMS Section Skeleton Loaders
 * 
 * Reusable skeleton components for CMS content sections on the homepage
 */

export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>
  )
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

export function SurfWeeksTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-4 sm:px-6 py-4">
              <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-10 bg-gray-200 rounded w-20 ml-auto"></div>
              </div>
              {/* Mobile skeleton */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RoomsGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  )
}

export function VideoSectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="bg-gray-200 aspect-video rounded-lg"></div>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 bg-gray-200 rounded-full mt-2"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

