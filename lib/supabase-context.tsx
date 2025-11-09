'use client'

import React, { createContext, useContext } from 'react'
import { supabase, supabaseAdmin } from './supabase'

interface SupabaseContextType {
  supabase: typeof supabase
  supabaseAdmin: typeof supabaseAdmin
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase, supabaseAdmin }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    return { supabase, supabaseAdmin }
  }
  return context
}
