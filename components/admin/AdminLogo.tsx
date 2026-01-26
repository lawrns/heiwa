import Link from 'next/link'

interface AdminLogoProps {
  collapsed?: boolean
  className?: string
}

export function AdminLogo({ collapsed = false, className = "" }: AdminLogoProps) {
  return (
    <Link href="/admin" className={`flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 ${className}`}>
      <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center transition-[width,height,background-color] duration-200`}>
        <span className="text-white font-bold text-xl">H</span>
      </div>
    </Link>
  )
}

export default AdminLogo
