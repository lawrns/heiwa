'use client'

import React, { createContext, useContext, useMemo, useRef } from 'react'
import { supabase } from './supabase'

interface SupabaseContextType {
  supabase: typeof supabase
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

function getSupabaseInstances(): SupabaseContextType {
  return {
    supabase
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
