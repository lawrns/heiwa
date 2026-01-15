'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAdminStatus } from '@/lib/admin/auth-utils'

export function AdminLoginHandler() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if we just returned from successful login
    const urlParams = new URLSearchParams(window.location.search)
    const loginSuccess = urlParams.get('login')
    
    if (loginSuccess === 'success') {
      // Set admin status in all storage mechanisms
      setAdminStatus()
      
      // Clean URL
      router.replace('/admin', false)
    }
  }, [router])
  
  // This component doesn't render anything
  return null
}
