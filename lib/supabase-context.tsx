'use client'

import React, { createContext, useContext, useMemo, useRef } from 'react'

interface SupabaseContextType {
  supabase: any
  supabaseAdmin: any
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Lazy load the instances to ensure they're only created once
// Import only when needed to prevent multiple initializations during hot reload
let supabaseInstance: any = null
let supabaseAdminInstance: any = null

function getSupabaseInstances(): SupabaseContextType {
  // Lazy import to prevent multiple instances during module initialization
  if (!supabaseInstance || !supabaseAdminInstance) {
    // Dynamic import ensures singleton pattern from lib/supabase.ts is respected
    const supabaseModule = require('./supabase')
    supabaseInstance = supabaseModule.supabase
    supabaseAdminInstance = supabaseModule.supabaseAdmin
  }
  
  return {
    supabase: supabaseInstance,
    supabaseAdmin: supabaseAdminInstance
  }
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Use ref to ensure we only get instances once per provider instance
  const instancesRef = useRef<SupabaseContextType | null>(null)
  
  // Get instances lazily - only create once
  if (!instancesRef.current) {
    instancesRef.current = getSupabaseInstances()
  }
  
  // Use useMemo to ensure we're using the same instances across re-renders
  const value = useMemo(() => instancesRef.current!, [])
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  
  // Always return the singleton instances from the module, not from context
  // This ensures we're always using the same instances even if context changes
  const instances = getSupabaseInstances()
  return instances
}
