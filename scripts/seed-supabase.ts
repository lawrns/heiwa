import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SeedData {
  clients: any[]
  rooms: any[]
  surfCamps: any[]
  addOns: any[]
  bookings: any[]
}

const sampleData: SeedData = {
  clients: [
    {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      notes: 'Regular customer, loves surf camps',
      last_booking_date: new Date('2024-01-10').toISOString()
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0124',
      notes: 'First time visitor, interested in beginner surf lessons',
      last_booking_date: new Date('2024-01-15').toISOString()
    },
    {
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1-555-0125',
      notes: 'Advanced surfer, prefers private lessons',
      last_booking_date: new Date('2024-01-20').toISOString()
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1-555-0126',
      notes: 'Group booking coordinator for corporate events',
      last_booking_date: new Date('2024-01-25').toISOString()
    },
    {
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1-555-0127',
      notes: 'Frequent visitor, owns equipment',
      last_booking_date: new Date('2024-01-30').toISOString()
    }
  ],

  rooms: [
    {
      name: 'Ocean View Suite',
      description: 'Spacious suite with stunning ocean views',
      capacity: 2,
      booking_type: 'whole',
      pricing: {
        basePrice: 250,
        weekendSurcharge: 50,
        seasonalRates: {
          high: 300,
          medium: 250,
          low: 200
        }
      },
      amenities: ['Ocean View', 'Balcony', 'Mini Bar', 'WiFi', 'Air Conditioning'],
      images: [],
      is_active: true
    },
    {
      name: 'Garden Villa',
      description: 'Private villa surrounded by tropical gardens',
      capacity: 4,
      booking_type: 'whole',
      pricing: {
        basePrice: 350,
        weekendSurcharge: 75,
        seasonalRates: {
          high: 400,
          medium: 350,
          low: 300
        }
      },
      amenities: ['Private Garden', 'Kitchen', 'WiFi', 'Air Conditioning', 'Jacuzzi'],
      images: [],
      is_active: true
    },
    {
      name: 'Shared Dorm - Bed 1',
      description: 'Budget-friendly shared accommodation',
      capacity: 1,
      booking_type: 'perBed',
      pricing: {
        basePrice: 45,
        weekendSurcharge: 10,
        seasonalRates: {
          high: 55,
          medium: 45,
          low: 35
        }
      },
      amenities: ['Shared Bathroom', 'WiFi', 'Locker', 'Common Area'],
      images: [],
      is_active: true
    },
    {
      name: 'Beach Bungalow',
      description: 'Cozy bungalow steps from the beach',
      capacity: 3,
      booking_type: 'whole',
      pricing: {
        basePrice: 200,
        weekendSurcharge: 40,
        seasonalRates: {
          high: 250,
          medium: 200,
          low: 150
        }
      },
      amenities: ['Beach Access', 'Kitchenette', 'WiFi', 'Fan', 'Outdoor Shower'],
      images: [],
      is_active: true
    }
  ],

  surfCamps: [
    {
      name: 'Beginner Surf Week',
      description: 'Perfect introduction to surfing with professional instructors',
      start_date: new Date('2024-03-01').toISOString(),
      end_date: new Date('2024-03-07').toISOString(),
      max_participants: 12,
      price: 599.00,
      level: 'beginner',
      includes: ['Daily surf lessons', 'Equipment rental', 'Breakfast', 'Transportation'],
      images: [],
      is_active: true
    },
    {
      name: 'Intermediate Surf Adventure',
      description: 'Take your surfing to the next level',
      start_date: new Date('2024-03-08').toISOString(),
      end_date: new Date('2024-03-14').toISOString(),
      max_participants: 10,
      price: 799.00,
      level: 'intermediate',
      includes: ['Advanced lessons', 'Video analysis', 'All meals', 'Accommodation'],
      images: [],
      is_active: true
    },
    {
      name: 'Pro Surf Intensive',
      description: 'Elite training for advanced surfers',
      start_date: new Date('2024-03-15').toISOString(),
      end_date: new Date('2024-03-21').toISOString(),
      max_participants: 6,
      price: 1299.00,
      level: 'advanced',
      includes: ['Private coaching', 'Competition prep', 'Premium accommodation', 'All meals'],
      images: [],
      is_active: true
    }
  ],

  addOns: [
    {
      name: 'Surfboard Rental',
      description: 'High-quality surfboards for all skill levels',
      price: 25.00,
      category: 'equipment',
      images: [],
      is_active: true,
      max_quantity: 20
    },
    {
      name: 'Wetsuit Rental',
      description: 'Premium wetsuits in all sizes',
      price: 15.00,
      category: 'equipment',
      images: [],
      is_active: true,
      max_quantity: 30
    },
    {
      name: 'Airport Transfer',
      description: 'Convenient transportation to/from airport',
      price: 45.00,
      category: 'transport',
      images: [],
      is_active: true,
      max_quantity: 10
    },
    {
      name: 'Massage Therapy',
      description: 'Relaxing massage after surf sessions',
      price: 80.00,
      category: 'service',
      images: [],
      is_active: true,
      max_quantity: 5
    },
    {
      name: 'Healthy Lunch Pack',
      description: 'Nutritious lunch for active days',
      price: 18.00,
      category: 'food',
      images: [],
      is_active: true,
      max_quantity: 50
    }
  ],

  bookings: [
    {
      client_ids: [], // Will be populated with actual client IDs
      items: [
        {
          id: 'item_001',
          type: 'room',
          itemId: '', // Will be populated with actual room ID
          name: 'Ocean View Suite',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 1000,
          nights: 4,
          startDate: new Date('2024-02-01').toISOString(),
          endDate: new Date('2024-02-05').toISOString()
        }
      ],
      total_amount: 1000.00,
      payment_status: 'confirmed',
      payment_method: 'stripe',
      notes: 'Anniversary celebration booking'
    }
  ]
}

async function seedSupabase() {
  console.log('🚀 Starting Supabase database seeding...')

  try {
    // Seed clients
    console.log('👥 Seeding clients...')
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert(sampleData.clients)
      .select('id')

    if (clientsError) {
      console.error('Error seeding clients:', clientsError)
      return
    }
    console.log(`✅ Seeded ${clients?.length || 0} clients`)

    // Seed rooms
    console.log('🏠 Seeding rooms...')
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .insert(sampleData.rooms)
      .select('id')

    if (roomsError) {
      console.error('Error seeding rooms:', roomsError)
      return
    }
    console.log(`✅ Seeded ${rooms?.length || 0} rooms`)

    // Seed surf camps
    console.log('🏄 Seeding surf camps...')
    const { data: surfCamps, error: surfCampsError } = await supabase
      .from('surf_camps')
      .insert(sampleData.surfCamps)
      .select('id')

    if (surfCampsError) {
      console.error('Error seeding surf camps:', surfCampsError)
      return
    }
    console.log(`✅ Seeded ${surfCamps?.length || 0} surf camps`)

    // Seed add-ons
    console.log('🛍️ Seeding add-ons...')
    const { data: addOns, error: addOnsError } = await supabase
      .from('add_ons')
      .insert(sampleData.addOns)
      .select('id')

    if (addOnsError) {
      console.error('Error seeding add-ons:', addOnsError)
      return
    }
    console.log(`✅ Seeded ${addOns?.length || 0} add-ons`)

    // Seed bookings (with actual client and room IDs)
    if (clients && clients.length > 0 && rooms && rooms.length > 0) {
      console.log('📅 Seeding bookings...')
      const bookingData = {
        ...sampleData.bookings[0],
        client_ids: [clients[0].id],
        items: [
          {
            ...sampleData.bookings[0].items[0],
            itemId: rooms[0].id
          }
        ]
      }

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select('id')

      if (bookingsError) {
        console.error('Error seeding bookings:', bookingsError)
      } else {
        console.log(`✅ Seeded ${bookings?.length || 0} bookings`)
      }
    }

    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   • ${clients?.length || 0} clients`)
    console.log(`   • ${rooms?.length || 0} rooms`)
    console.log(`   • ${surfCamps?.length || 0} surf camps`)
    console.log(`   • ${addOns?.length || 0} add-ons`)
    console.log(`   • 1 booking`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Run seeding
if (require.main === module) {
  seedSupabase()
}
