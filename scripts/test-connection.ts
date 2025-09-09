#!/usr/bin/env tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔗 Testing Heiwa House Supabase Connection...')
console.log(`📍 URL: ${supabaseUrl}`)
console.log(`🔑 Using service role key: ${supabaseServiceKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📊 Testing database connection...')
    
    // Test clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email')
      .limit(3)
    
    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError)
      return
    }
    
    console.log(`✅ Clients table: ${clients?.length} records found`)
    clients?.forEach(client => {
      console.log(`   - ${client.name} (${client.email})`)
    })
    
    // Test rooms table
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, capacity, booking_type')
      .limit(3)
    
    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError)
      return
    }
    
    console.log(`✅ Rooms table: ${rooms?.length} records found`)
    rooms?.forEach(room => {
      console.log(`   - ${room.name} (${room.capacity} capacity, ${room.booking_type})`)
    })
    
    // Test surf camps table
    const { data: surfCamps, error: surfCampsError } = await supabase
      .from('surf_camps')
      .select('id, name, start_date, end_date')
      .limit(3)
    
    if (surfCampsError) {
      console.error('❌ Error fetching surf camps:', surfCampsError)
      return
    }
    
    console.log(`✅ Surf camps table: ${surfCamps?.length} records found`)
    surfCamps?.forEach(camp => {
      console.log(`   - ${camp.name} (${camp.start_date} to ${camp.end_date})`)
    })
    
    // Test storage buckets
    console.log('\n🗂️ Testing storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError)
      return
    }
    
    console.log(`✅ Storage buckets: ${buckets?.length} found`)
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    console.log('\n🎉 All tests passed! Heiwa House is successfully connected to Supabase.')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
