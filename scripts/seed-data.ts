import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../src/lib/firebase'

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
      id: 'client_001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      brand: 'Heiwa House',
      status: 'Active',
      registrationDate: Timestamp.fromDate(new Date('2023-06-15')),
      createdAt: Timestamp.fromDate(new Date('2023-06-15')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
      notes: 'Regular customer, loves surf camps',
      lastBookingDate: Timestamp.fromDate(new Date('2024-01-10'))
    },
    {
      id: 'client_002',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0456',
      brand: 'Freedom Routes',
      status: 'Active',
      registrationDate: Timestamp.fromDate(new Date('2023-08-22')),
      createdAt: Timestamp.fromDate(new Date('2023-08-22')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-08')),
      notes: 'Adventure enthusiast',
      lastBookingDate: Timestamp.fromDate(new Date('2024-01-08'))
    },
    {
      id: 'client_003',
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+1-555-0789',
      brand: 'Heiwa House',
      status: 'Active',
      registrationDate: Timestamp.fromDate(new Date('2023-09-10')),
      createdAt: Timestamp.fromDate(new Date('2023-09-10')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-05')),
      notes: 'Group leader for corporate retreats',
      lastBookingDate: Timestamp.fromDate(new Date('2024-01-05'))
    },
    {
      id: 'client_004',
      name: 'Sarah Wilson',
      email: 'sarah.w@email.com',
      phone: '+1-555-0321',
      brand: 'Freedom Routes',
      status: 'Active',
      registrationDate: Timestamp.fromDate(new Date('2023-11-03')),
      createdAt: Timestamp.fromDate(new Date('2023-11-03')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-12')),
      notes: 'First-time visitor, beginner level',
      lastBookingDate: Timestamp.fromDate(new Date('2024-01-12'))
    },
    {
      id: 'client_005',
      name: 'David Brown',
      email: 'david.b@email.com',
      phone: '+1-555-0654',
      brand: 'Heiwa House',
      status: 'Inactive',
      registrationDate: Timestamp.fromDate(new Date('2023-04-18')),
      createdAt: Timestamp.fromDate(new Date('2023-04-18')),
      updatedAt: Timestamp.fromDate(new Date('2023-12-01')),
      notes: 'Moved to another location',
      lastBookingDate: Timestamp.fromDate(new Date('2023-11-15'))
    }
  ],

  rooms: [
    {
      id: 'room_001',
      name: 'Ocean View Suite',
      description: 'Spacious suite with stunning ocean views',
      capacity: 2,
      basePrice: 250,
      amenities: ['Ocean View', 'Balcony', 'Mini Bar', 'WiFi', 'Air Conditioning'],
      status: 'Available',
      roomNumber: '101',
      floor: 1,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'room_002',
      name: 'Garden Villa',
      description: 'Private villa surrounded by tropical gardens',
      capacity: 4,
      basePrice: 350,
      amenities: ['Private Garden', 'Kitchen', 'WiFi', 'Air Conditioning', 'Jacuzzi'],
      status: 'Available',
      roomNumber: '201',
      floor: 2,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'room_003',
      name: 'Beach Bungalow',
      description: 'Charming bungalow steps from the beach',
      capacity: 2,
      basePrice: 200,
      amenities: ['Beach Access', 'WiFi', 'Air Conditioning', 'Mini Fridge'],
      status: 'Available',
      roomNumber: '102',
      floor: 1,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'room_004',
      name: 'Family Suite',
      description: 'Large suite perfect for families',
      capacity: 6,
      basePrice: 450,
      amenities: ['Ocean View', 'Kitchen', 'WiFi', 'Air Conditioning', 'Game Room'],
      status: 'Available',
      roomNumber: '301',
      floor: 3,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    }
  ],

  surfCamps: [
    {
      id: 'camp_001',
      name: 'Beginner Surf Camp',
      description: 'Perfect for first-time surfers',
      category: 'Beginner',
      capacity: 8,
      duration: 3,
      price: 450,
      startDate: Timestamp.fromDate(new Date('2024-02-01')),
      endDate: Timestamp.fromDate(new Date('2024-02-03')),
      instructor: 'Carlos Rodriguez',
      difficulty: 'Beginner',
      status: 'Available',
      createdAt: Timestamp.fromDate(new Date('2023-12-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'camp_002',
      name: 'Advanced Wave Riding',
      description: 'Master advanced surfing techniques',
      category: 'Advanced',
      capacity: 6,
      duration: 5,
      price: 750,
      startDate: Timestamp.fromDate(new Date('2024-02-15')),
      endDate: Timestamp.fromDate(new Date('2024-02-19')),
      instructor: 'Maria Santos',
      difficulty: 'Advanced',
      status: 'Available',
      createdAt: Timestamp.fromDate(new Date('2023-12-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'camp_003',
      name: 'Family Surf Adventure',
      description: 'Fun surf camp for families',
      category: 'Family',
      capacity: 12,
      duration: 2,
      price: 350,
      startDate: Timestamp.fromDate(new Date('2024-03-01')),
      endDate: Timestamp.fromDate(new Date('2024-03-02')),
      instructor: 'Team Instructors',
      difficulty: 'All Levels',
      status: 'Available',
      createdAt: Timestamp.fromDate(new Date('2023-12-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    }
  ],

  addOns: [
    {
      id: 'addon_001',
      name: 'Surfboard Rental',
      description: 'High-quality surfboard rental per day',
      category: 'Equipment',
      price: 25,
      unit: 'per day',
      available: true,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'addon_002',
      name: 'Wetsuit Rental',
      description: 'Premium wetsuit rental per day',
      category: 'Equipment',
      price: 15,
      unit: 'per day',
      available: true,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'addon_003',
      name: 'Private Lesson',
      description: 'One-on-one surf lesson with instructor',
      category: 'Service',
      price: 80,
      unit: 'per hour',
      available: true,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    },
    {
      id: 'addon_004',
      name: 'Photography Package',
      description: 'Professional surf photography session',
      category: 'Service',
      price: 120,
      unit: 'per session',
      available: true,
      createdAt: Timestamp.fromDate(new Date('2023-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01'))
    }
  ],

  bookings: [
    {
      id: 'booking_001',
      clientIds: ['client_001'],
      primaryClientId: 'client_001',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      totalAmount: 850,
      currency: 'USD',
      checkInDate: Timestamp.fromDate(new Date('2024-02-01')),
      checkOutDate: Timestamp.fromDate(new Date('2024-02-05')),
      createdAt: Timestamp.fromDate(new Date('2024-01-10')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
      items: [
        {
          id: 'item_001',
          type: 'room',
          itemId: 'room_001',
          name: 'Ocean View Suite',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 1000,
          nights: 4,
          startDate: Timestamp.fromDate(new Date('2024-02-01')),
          endDate: Timestamp.fromDate(new Date('2024-02-05'))
        },
        {
          id: 'item_002',
          type: 'surfCamp',
          itemId: 'camp_001',
          name: 'Beginner Surf Camp',
          quantity: 1,
          unitPrice: 450,
          totalPrice: 450,
          startDate: Timestamp.fromDate(new Date('2024-02-01')),
          endDate: Timestamp.fromDate(new Date('2024-02-03'))
        }
      ],
      notes: 'First-time visitor, excited for surf camp'
    },
    {
      id: 'booking_002',
      clientIds: ['client_002'],
      primaryClientId: 'client_002',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      totalAmount: 600,
      currency: 'USD',
      checkInDate: Timestamp.fromDate(new Date('2024-01-20')),
      checkOutDate: Timestamp.fromDate(new Date('2024-01-25')),
      createdAt: Timestamp.fromDate(new Date('2024-01-08')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-08')),
      items: [
        {
          id: 'item_003',
          type: 'room',
          itemId: 'room_002',
          name: 'Garden Villa',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 1400,
          nights: 4,
          startDate: Timestamp.fromDate(new Date('2024-01-20')),
          endDate: Timestamp.fromDate(new Date('2024-01-25'))
        }
      ],
      notes: 'Adventure enthusiast, looking forward to surfing'
    },
    {
      id: 'booking_003',
      clientIds: ['client_003', 'client_004'],
      primaryClientId: 'client_003',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      totalAmount: 1200,
      currency: 'USD',
      checkInDate: Timestamp.fromDate(new Date('2024-03-01')),
      checkOutDate: Timestamp.fromDate(new Date('2024-03-05')),
      createdAt: Timestamp.fromDate(new Date('2024-01-05')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-05')),
      items: [
        {
          id: 'item_004',
          type: 'room',
          itemId: 'room_004',
          name: 'Family Suite',
          quantity: 1,
          unitPrice: 450,
          totalPrice: 1800,
          nights: 4,
          startDate: Timestamp.fromDate(new Date('2024-03-01')),
          endDate: Timestamp.fromDate(new Date('2024-03-05'))
        },
        {
          id: 'item_005',
          type: 'surfCamp',
          itemId: 'camp_003',
          name: 'Family Surf Adventure',
          quantity: 2,
          unitPrice: 350,
          totalPrice: 700,
          startDate: Timestamp.fromDate(new Date('2024-03-01')),
          endDate: Timestamp.fromDate(new Date('2024-03-02'))
        }
      ],
      notes: 'Corporate team building event'
    }
  ]
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  const db = getDb()
  if (!db) {
    console.error('❌ Cannot connect to Firestore database')
    return
  }

  try {
    // Seed clients
    console.log('📝 Seeding clients...')
    for (const client of sampleData.clients) {
      await addDoc(collection(db, 'clients'), client)
    }
    console.log(`✅ Seeded ${sampleData.clients.length} clients`)

    // Seed rooms
    console.log('🏠 Seeding rooms...')
    for (const room of sampleData.rooms) {
      await addDoc(collection(db, 'rooms'), room)
    }
    console.log(`✅ Seeded ${sampleData.rooms.length} rooms`)

    // Seed surf camps
    console.log('🏄 Seeding surf camps...')
    for (const camp of sampleData.surfCamps) {
      await addDoc(collection(db, 'surfCamps'), camp)
    }
    console.log(`✅ Seeded ${sampleData.surfCamps.length} surf camps`)

    // Seed add-ons
    console.log('🛍️ Seeding add-ons...')
    for (const addon of sampleData.addOns) {
      await addDoc(collection(db, 'addOns'), addon)
    }
    console.log(`✅ Seeded ${sampleData.addOns.length} add-ons`)

    // Seed bookings
    console.log('📅 Seeding bookings...')
    for (const booking of sampleData.bookings) {
      await addDoc(collection(db, 'bookings'), booking)
    }
    console.log(`✅ Seeded ${sampleData.bookings.length} bookings`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   • ${sampleData.clients.length} clients`)
    console.log(`   • ${sampleData.rooms.length} rooms`)
    console.log(`   • ${sampleData.surfCamps.length} surf camps`)
    console.log(`   • ${sampleData.addOns.length} add-ons`)
    console.log(`   • ${sampleData.bookings.length} bookings`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Export for use in other scripts
export { seedDatabase, sampleData }

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

