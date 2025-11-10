import Link from 'next/link'

interface AdminLogoProps {
  collapsed?: boolean
  className?: string
}

export function AdminLogo({ collapsed = false, className = "" }: AdminLogoProps) {
  return (
    <Link href="/admin" className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center transition-all duration-200`}>
        <span className="text-white font-bold text-xl">H</span>
      </div>
    </Link>
  )
}

export default AdminLogo
