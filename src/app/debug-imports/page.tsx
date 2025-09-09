'use client'

import { useState } from 'react'

// Test imports one by one to isolate the failing module
// Uncomment each import group one at a time to find the problematic one

// Group 1: Basic UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// Group 2: Next.js components
// import Link from 'next/link'

// Group 3: Third-party libraries
import { motion } from 'framer-motion'

// Group 4: Lucide icons
// import {
//   CalendarIcon,
//   BedIcon,
//   Waves,
//   UsersIcon,
//   Calendar,
//   BarChart3Icon
// } from 'lucide-react'

// Group 5: Supabase client
// import { supabase } from '@/lib/supabase/client'

// Group 6: Auth components
// import { AuthProvider } from '@/components/AuthProvider'

export default function DebugImportsPage() {
  const [testState, setTestState] = useState('Basic React works')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Imports Page</h1>
      <p className="text-gray-600 mb-4">
        Uncomment import groups one by one to isolate the failing module.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ {testState}</p>
        </div>
        
        <button 
          onClick={() => setTestState('State update works')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test State Update
        </button>
        
        {/* Uncomment sections below one by one */}
        
        {/* Test Group 1: UI Components */}
        <Card>
          <CardHeader>
            <CardTitle>UI Components Test</CardTitle>
            <CardDescription>Testing Card components</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Test Button</Button>
            <Progress value={50} className="mt-2" />
          </CardContent>
        </Card>
        
        {/* Test Group 2: Next.js Link */}
        {/*
        <Link href="/debug" className="text-blue-500 underline">
          Test Next.js Link
        </Link>
        */}
        
        {/* Test Group 3: Framer Motion */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-purple-100 rounded"
        >
          Test Framer Motion
        </motion.div>
        
        {/* Test Group 4: Lucide Icons */}
        {/*
        <div className="flex space-x-2">
          <CalendarIcon className="w-6 h-6" />
          <BedIcon className="w-6 h-6" />
          <Waves className="w-6 h-6" />
          <UsersIcon className="w-6 h-6" />
        </div>
        */}
        
        {/* Test Group 5: Supabase */}
        {/*
        <button 
          onClick={() => console.log('Supabase client:', supabase)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Supabase Client
        </button>
        */}
      </div>
    </div>
  )
}
