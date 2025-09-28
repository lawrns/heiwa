// CMS Migration Script
// Run with: node lib/cms-migrate.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zejrhceuuujzgyukdwnb.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc'

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting CMS migration...')

  try {
    // Create navigation_items table
    console.log('📝 Creating navigation_items table...')
    const { error: navError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS navigation_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          path TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (navError) {
      console.log('Navigation table creation result:', navError)
    }

    // Create rooms table
    console.log('🏠 Creating rooms table...')
    const { error: roomsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS rooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          image_url TEXT,
          description TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (roomsError) {
      console.log('Rooms table creation result:', roomsError)
    }

    // Create experiences table
    console.log('🎯 Creating experiences table...')
    const { error: expError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS experiences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          image_url TEXT,
          category TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (expError) {
      console.log('Experiences table creation result:', expError)
    }

    // Create pages table
    console.log('📄 Creating pages table...')
    const { error: pagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          content JSONB NOT NULL,
          published BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (pagesError) {
      console.log('Pages table creation result:', pagesError)
    }

    console.log('✅ Tables created successfully!')

    // Insert initial data using direct inserts instead of RPC
    console.log('📥 Inserting initial navigation data...')
    const { error: navInsertError } = await supabase
      .from('navigation_items')
      .upsert([
        { name: 'HOME', path: '/', order_index: 1 },
        { name: 'THE SPOT', path: '/the-spot', order_index: 2 },
        { name: 'ROOM RENTALS', path: '/rooms', order_index: 3 },
        { name: 'SURF CAMP', path: '/surf-weeks', order_index: 4 }
      ], { onConflict: 'path' })

    if (navInsertError) {
      console.log('Navigation insert error:', navInsertError)
    }

    console.log('🏠 Inserting initial rooms data...')
    const { error: roomsInsertError } = await supabase
      .from('rooms')
      .insert([
        { name: 'Room Nr 1', image_url: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-52-scaled-570x600.jpg' },
        { name: 'Room Nr 2', image_url: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-29-scaled-570x600.webp' },
        { name: 'Room Nr 3', image_url: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-22-scaled-570x600.webp' },
        { name: 'Dorm room', image_url: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-1-scaled-570x600.webp' }
      ])

    if (roomsInsertError) {
      console.log('Rooms insert error:', roomsInsertError)
    }

    console.log('🎯 Inserting initial experiences data...')
    const { error: expInsertError } = await supabase
      .from('experiences')
      .insert([
        { title: 'Hiking', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/8B8BA276-6D91-419B-B8F4-7696042ED92F-01.jpeg' },
        { title: 'Horseback Riding', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-39-scaled.jpg' },
        { title: 'Sauna', image_url: 'https://heiwahouse.com/wp-content/uploads/2024/12/portrait_sauna3.jpg' },
        { title: 'Surfing', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/Surf-Lessons.jpg' },
        { title: 'Skatepark', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/skatepark-1.jpg' },
        { title: 'Yoga', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/Yoga.jpg' },
        { title: 'Bicycle Ride', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-7-scaled.jpg' },
        { title: 'Day Trips', image_url: 'https://heiwahouse.com/wp-content/uploads/2025/01/DSCF8628.jpg' }
      ])

    if (expInsertError) {
      console.log('Experiences insert error:', expInsertError)
    }

    console.log('📄 Inserting initial pages data...')
    const { error: pagesInsertError } = await supabase
      .from('pages')
      .upsert([
        {
          slug: 'home',
          title: 'Heiwa House - A Wave Away | Surf & Adventure Retreat',
          content: {
            hero: {
              title: "Nestled on Portugal's coast, Heiwa House is your sanctuary for rest and adventure.",
              subtitle: "A WAVE AWAY",
              backgroundImage: "/images/hero/heiwa-hero.jpg",
              cta: [{ label: "EXPLORE", href: "/rooms" }]
            },
            featureCards: [
              { title: "Heiwa Play", image: "https://heiwahouse.com/wp-content/uploads/2025/01/play.jpg", href: "/the-spot#play" },
              { title: "Heiwa Surf", image: "https://heiwahouse.com/wp-content/uploads/2025/01/surf4.jpg", href: "/surf-weeks" },
              { title: "Heiwa Flow", image: "https://heiwahouse.com/wp-content/uploads/2024/12/image00023-722x1024.jpeg", href: "/the-spot#flow" }
            ],
            videoEmbed: {
              provider: "youtube",
              src: "https://youtu.be/9nhQiKGsgHg",
              poster: "/images/posters/surfweeks.svg"
            }
          },
          published: true
        },
        {
          slug: 'rooms',
          title: 'Room Rentals - Heiwa House Accommodation',
          content: {
            bookingCta: { label: "Check Availability", href: "/rooms#booking" }
          },
          published: true
        },
        {
          slug: 'experiences',
          title: 'Experiences - Heiwa House Activities',
          content: {},
          published: true
        },
        {
          slug: 'surf-weeks',
          title: 'Surf Weeks - Professional Surf Training Program',
          content: {
            videoEmbed: {
              provider: "youtube",
              src: "https://youtu.be/9nhQiKGsgHg",
              poster: "/images/posters/surfweeks.svg"
            },
            program: {
              title: "Surf Weeks Program",
              description: "Join our comprehensive surf training program designed for all skill levels.",
              features: [
                "Professional surf instruction",
                "Equipment provided",
                "Small group sessions",
                "Beachside accommodation",
                "Video analysis and feedback",
                "Certification upon completion"
              ]
            }
          },
          published: true
        }
      ], { onConflict: 'slug' })

    if (pagesInsertError) {
      console.log('Pages insert error:', pagesInsertError)
    }

    console.log('🎉 Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()