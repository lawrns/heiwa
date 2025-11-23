'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { supabase, supabaseAdmin } from './supabase'

interface SupabaseContextType {
  supabase: typeof supabase
  supabaseAdmin: typeof supabaseAdmin
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Lazy load the instances to ensure they're only created once
// This prevents multiple instances from being created during module initialization
let contextValue: SupabaseContextType | null = null

function getContextValue(): SupabaseContextType {
  if (!contextValue) {
    contextValue = { supabase, supabaseAdmin }
  }
  return contextValue
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Use useMemo to ensure we're using the same instances
  const value = useMemo(() => getContextValue(), [])
  
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
  // This ensures we're always using the same instances
  return { supabase, supabaseAdmin }
}
