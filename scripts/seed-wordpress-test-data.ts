import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🌐 Seeding script database config:', {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length
})

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * WordPress Widget Test Data Seeding Script
 * Creates realistic mock data for testing the WordPress booking widget
 */

interface WordPressTestData {
  surfCamps: any[]
  clients: any[]
  bookings: any[]
}

const wordpressTestData: WordPressTestData = {
  surfCamps: [
    {
      name: 'Beginner Surf Paradise - Sayulita',
      description: 'Gentle waves perfect for first-time surfers. Professional instruction in the beautiful Sayulita bay with stunning sunsets and relaxed atmosphere.',
      start_date: new Date('2024-03-01').toISOString(),
      end_date: new Date('2024-03-07').toISOString(),
      max_participants: 12,
      price: 599.00,
      level: 'beginner',
      includes: [
        '6 days professional surf instruction',
        'Board rental and wetsuits',
        'Daily breakfast and beach lunches',
        'Airport transfers from Puerto Vallarta',
        'Welcome dinner with local cuisine',
        'Surf photos and video highlights',
        'Beach yoga sessions',
        'Local cultural activities'
      ],
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
        'https://images.unsplash.com/photo-1502681989156-712137e4fe08?w=800',
        'https://images.unsplash.com/photo-1502680390469-d8e1b4c865e5?w=800'
      ],
      is_active: true
    },
    {
      name: 'Advanced Wave Riders - Mazatlan',
      description: 'Challenge yourself in the powerful waves of Mazatlan. Advanced techniques and big wave surfing with experienced instructors.',
      start_date: new Date('2024-03-15').toISOString(),
      end_date: new Date('2024-03-21').toISOString(),
      max_participants: 8,
      price: 799.00,
      level: 'advanced',
      includes: [
        '6 days advanced surf instruction',
        'Premium board rental and wetsuits',
        'Private coaching sessions',
        'Video analysis and feedback',
        'Big wave safety training',
        'Professional surf photography',
        'Local surf spot exploration',
        'Recovery and fitness sessions'
      ],
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
        'https://images.unsplash.com/photo-1502681989156-712137e4fe08?w=800'
      ],
      is_active: true
    },
    {
      name: 'Family Surf Adventure - Puerto Escondido',
      description: 'Perfect family surf camp with programs for all ages and skill levels. From tiny tots to grandparents, everyone gets wet!',
      start_date: new Date('2024-04-01').toISOString(),
      end_date: new Date('2024-04-07').toISOString(),
      max_participants: 16,
      price: 699.00,
      level: 'all',
      includes: [
        'Age-appropriate surf instruction',
        'Family activities and games',
        'Beach yoga and fitness',
        'Kids club with supervision',
        'Family-friendly meals',
        'Photo sessions',
        'Local excursions',
        'Cultural experiences'
      ],
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
        'https://images.unsplash.com/photo-1502681989156-712137e4fe08?w=800'
      ],
      is_active: true
    },
    {
      name: 'Intermediate Surf Progression - Mazatlan',
      description: 'Take your surfing to the next level with intermediate techniques and wave reading skills.',
      start_date: new Date('2024-03-08').toISOString(),
      end_date: new Date('2024-03-14').toISOString(),
      max_participants: 10,
      price: 699.00,
      level: 'intermediate',
      includes: [
        '6 days intermediate surf instruction',
        'Board rental and wetsuits',
        'Wave reading and forecasting',
        'Advanced techniques training',
        'Group surf sessions',
        'Beach workouts',
        'Local surf culture immersion'
      ],
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
        'https://images.unsplash.com/photo-1502681989156-712137e4fe08?w=800'
      ],
      is_active: true
    },
    {
      name: 'Two Week Surf Intensive - Sayulita',
      description: 'Extended surf camp for serious improvement. Two full weeks of intensive training and practice.',
      start_date: new Date('2024-03-01').toISOString(),
      end_date: new Date('2024-03-14').toISOString(),
      max_participants: 8,
      price: 1299.00,
      level: 'intermediate',
      includes: [
        '14 days professional instruction',
        'Daily surf sessions',
        'Technique refinement',
        'Video analysis',
        'Private coaching',
        'All meals included',
        'Airport transfers',
        'Accommodation included'
      ],
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
        'https://images.unsplash.com/photo-1502681989156-712137e4fe08?w=800'
      ],
      is_active: true
    }
  ],
  clients: [
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@test.com',
      phone: '+52-555-0123',
      notes: 'Created from WordPress widget test booking'
    },
    {
      name: 'Carlos Rodriguez',
      email: 'carlos@test.com',
      phone: '+52-555-0124',
      notes: 'Group booking participant'
    },
    {
      name: 'Ana Rodriguez',
      email: 'ana@test.com',
      phone: '+52-555-0125',
      notes: 'Family booking participant'
    }
  ],
  bookings: []
}

async function seedWordPressTestData() {
  console.log('🌊 Starting WordPress widget test data seeding...')

  try {
    // Clear existing test data first
    console.log('🧹 Clearing existing test data...')

    await supabase.from('bookings').delete().like('notes', '%WordPress%')
    await supabase.from('clients').delete().like('email', '%@test.com')
    await supabase.from('surf_camps').delete().like('name', '%WordPress%')
    await supabase.from('surf_camps').delete().like('name', '%Beginner Surf Paradise%')
    await supabase.from('surf_camps').delete().like('name', '%Advanced Wave Riders%')
    await supabase.from('surf_camps').delete().like('name', '%Family Surf Adventure%')

    // Seed surf camps
    console.log('🏄‍♂️ Seeding surf camps...')
    for (const camp of wordpressTestData.surfCamps) {
      const { error } = await supabase.from('surf_camps').insert(camp)
      if (error) {
        console.error(`❌ Error seeding camp ${camp.name}:`, error)
      } else {
        console.log(`✅ Seeded camp: ${camp.name}`)
      }
    }

    // Seed clients
    console.log('👥 Seeding test clients...')
    for (const client of wordpressTestData.clients) {
      const { error } = await supabase.from('clients').insert(client)
      if (error) {
        console.error(`❌ Error seeding client ${client.name}:`, error)
      } else {
        console.log(`✅ Seeded client: ${client.name}`)
      }
    }

    // Seed bookings
    console.log('📅 Seeding test bookings...')
    for (const booking of wordpressTestData.bookings) {
      const { error } = await supabase.from('bookings').insert(booking)
      if (error) {
        console.error('❌ Error seeding booking:', error)
      } else {
        console.log('✅ Seeded booking with source:', booking.source)
      }
    }

    // Verify the data was actually inserted
    console.log('\n🔍 Verifying inserted data...')
    const { data: verifyCamps, error: verifyError } = await supabase
      .from('surf_camps')
      .select('id, name')
      .limit(5)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
    } else {
      console.log(`✅ Verification: Found ${verifyCamps?.length || 0} surf camps in database`)
      verifyCamps?.forEach(camp => console.log(`   - ${camp.name} (${camp.id})`))
    }

    console.log('\n🎉 WordPress widget test data seeding completed!')
    console.log('\n📊 Test Data Summary:')
    console.log(`   • ${wordpressTestData.surfCamps.length} surf camps`)
    console.log(`   • ${wordpressTestData.clients.length} test clients`)
    console.log(`   • ${wordpressTestData.bookings.length} existing bookings`)
    console.log('\n🚀 Ready for WordPress widget testing!')
    console.log('   API endpoints available at: http://localhost:3005/api/wordpress/*')

  } catch (error) {
    console.error('❌ Error seeding WordPress test data:', error)
    process.exit(1)
  }
}

// Run the seeding
seedWordPressTestData()
  .then(() => {
    console.log('\n✨ WordPress test data seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error)
    process.exit(1)
  })
