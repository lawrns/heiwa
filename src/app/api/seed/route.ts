import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

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
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase for server-side use
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMOMEASURE"
    }

    let app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    const db = getFirestore(app)

    const { action } = await request.json()

    if (action === 'seed') {
      // Clear existing data first (optional)
      const collections = ['clients', 'rooms', 'surfCamps', 'addOns', 'bookings']

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName))
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }

      // Seed new data
      const results = []

      for (const [collectionName, documents] of Object.entries(sampleData)) {
        const promises = documents.map(doc => addDoc(collection(db, collectionName), doc))
        const result = await Promise.all(promises)
        results.push({ collection: collectionName, count: result.length })
      }

      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully',
        results
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database seeding API',
    endpoints: {
      POST: '/api/seed with { action: "seed" }'
    }
  })
}
