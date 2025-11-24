/**
 * Check room images in database
 * Run: node scripts/check-room-images.js
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function checkRoomImages() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    const result = await client.query(`
      SELECT 
        id,
        name,
        images,
        array_length(images, 1) as image_count
      FROM rooms
      ORDER BY name
    `)

    console.log(`Found ${result.rows.length} rooms:\n`)

    result.rows.forEach((room, index) => {
      console.log(`${index + 1}. ${room.name}`)
      console.log(`   ID: ${room.id}`)
      console.log(`   Images array: ${JSON.stringify(room.images)}`)
      console.log(`   Image count: ${room.image_count || 0}`)
      const featuredImage = room.images && room.images.length > 0 ? room.images[0] : null
      console.log(`   Featured image (first in array): ${featuredImage || 'NULL'}`)
      
      if (room.images && Array.isArray(room.images) && room.images.length > 0) {
        console.log(`   First image URL: ${room.images[0]}`)
        // Check if URL is valid
        if (room.images[0] && typeof room.images[0] === 'string') {
          if (room.images[0].startsWith('http')) {
            console.log(`   ✅ Valid HTTP(S) URL`)
          } else if (room.images[0].startsWith('/')) {
            console.log(`   ⚠️  Relative path (may not work)`)
          } else {
            console.log(`   ❌ Invalid URL format`)
          }
        }
      } else {
        console.log(`   ❌ No images found`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

checkRoomImages()

