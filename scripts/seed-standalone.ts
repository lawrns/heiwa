import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDQTtlEowOBdeDj-StcrlnscogXpmy52x4",
  authDomain: "heiwahousedashboard.firebaseapp.com",
  projectId: "heiwahousedashboard",
  storageBucket: "heiwahousedashboard.firebasestorage.app",
  messagingSenderId: "221240912006",
  appId: "1:221240912006:web:1c7a974b44c5361519c907",
  measurementId: "G-ZBSB3V5M6J"
}

const sampleData = {
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
    }
  ]
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)

    console.log('📝 Seeding clients...')
    for (const client of sampleData.clients) {
      await addDoc(collection(db, 'clients'), client)
    }
    console.log(`✅ Seeded ${sampleData.clients.length} clients`)

    console.log('🏠 Seeding rooms...')
    for (const room of sampleData.rooms) {
      await addDoc(collection(db, 'rooms'), room)
    }
    console.log(`✅ Seeded ${sampleData.rooms.length} rooms`)

    console.log('🏄 Seeding surf camps...')
    for (const camp of sampleData.surfCamps) {
      await addDoc(collection(db, 'surfCamps'), camp)
    }
    console.log(`✅ Seeded ${sampleData.surfCamps.length} surf camps`)

    console.log('🛍️ Seeding add-ons...')
    for (const addon of sampleData.addOns) {
      await addDoc(collection(db, 'addOns'), addon)
    }
    console.log(`✅ Seeded ${sampleData.addOns.length} add-ons`)

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
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}
