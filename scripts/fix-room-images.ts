// Script to fix corrupted room image paths in Supabase
// This removes the incorrect /images/rooms/ prefix from full URLs

import { supabaseAdmin } from '../lib/supabase'

async function fixRoomImages() {
  console.log('🔧 Fixing corrupted room image paths...')

  // Fetch all rooms
  const { data: rooms, error: fetchError } = await supabaseAdmin
    .from('rooms')
    .select('*')

  if (fetchError) {
    console.error('❌ Error fetching rooms:', fetchError)
    return
  }

  console.log(`📋 Found ${rooms?.length || 0} rooms`)

  // Fix each room's images
  for (const room of rooms || []) {
    console.log(`\n🏠 Processing room: ${room.name} (${room.id})`)
    console.log(`   Current images:`, room.images)

    // Fix corrupted URLs
    const fixedImages = room.images?.map((img: string) => {
      // Fix incorrectly prefixed Supabase URLs
      if (img.includes('/images/rooms/https://')) {
        return img.replace('/images/rooms/https://', 'https://')
      }
      // Fix incorrectly prefixed HTTP URLs
      if (img.includes('/images/rooms/http://')) {
        return img.replace('/images/rooms/http://', 'http://')
      }
      // Keep everything else as-is
      return img
    })

    // Check if update is needed
    const needsUpdate = JSON.stringify(room.images) !== JSON.stringify(fixedImages)
    if (!needsUpdate) {
      console.log('   ✅ Images already correct')
      continue
    }

    console.log(`   Fixed images:`, fixedImages)

    // Update the room
    const { error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({ images: fixedImages })
      .eq('id', room.id)

    if (updateError) {
      console.error(`   ❌ Error updating room ${room.id}:`, updateError)
    } else {
      console.log(`   ✅ Successfully fixed`)
    }
  }

  console.log('\n✨ Room image fix complete!')
}

// Run the script
fixRoomImages().catch(console.error)