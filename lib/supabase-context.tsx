'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { supabase, supabaseAdmin } from './supabase'

interface SupabaseContextType {
  supabase: typeof supabase
  supabaseAdmin: typeof supabaseAdmin
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Memoize the context value to prevent recreating instances
const contextValue = { supabase, supabaseAdmin }

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Use useMemo to ensure we're using the same instances
  const value = useMemo(() => contextValue, [])
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  // Always return the singleton instances, not context (which might cause re-creation)
  return { supabase, supabaseAdmin }
}
