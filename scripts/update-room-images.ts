// Script to update room image paths in Supabase
// This updates relative paths to absolute paths for heiwa-page

import { supabaseAdmin } from '../lib/supabase'

async function updateRoomImages() {
  console.log('🔄 Updating room image paths...')

  // Fetch all rooms
  const { data: rooms, error: fetchError } = await supabaseAdmin
    .from('rooms')
    .select('*')

  if (fetchError) {
    console.error('❌ Error fetching rooms:', fetchError)
    return
  }

  console.log(`📋 Found ${rooms?.length || 0} rooms`)

  // Update each room's images to use /images/rooms/ prefix
  for (const room of rooms || []) {
    console.log(`\n🏠 Processing room: ${room.name} (${room.id})`)
    console.log(`   Current images:`, room.images)

    // Update images: keep Supabase URLs as-is, prefix relative paths
    const updatedImages = room.images?.map((img: string) => {
      // If it's already a full URL (Supabase storage), keep it as-is
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img
      }
      // If it already has the /images/rooms/ prefix, keep it
      if (img.startsWith('/images/rooms/')) {
        return img
      }
      // Otherwise, add the /images/rooms/ prefix
      const fileName = img.replace(/^\/+/, '')
      return `/images/rooms/${fileName}`
    })

    // Check if update is needed
    const needsUpdate = JSON.stringify(room.images) !== JSON.stringify(updatedImages)
    if (!needsUpdate) {
      console.log('   ✅ Images already correct')
      continue
    }

    console.log(`   New images:`, updatedImages)

    // Update the room
    const { error: updateError } = await supabaseAdmin
      .from('rooms')
      .update({ images: updatedImages })
      .eq('id', room.id)

    if (updateError) {
      console.error(`   ❌ Error updating room ${room.id}:`, updateError)
    } else {
      console.log(`   ✅ Successfully updated`)
    }
  }

  console.log('\n✨ Room image update complete!')
}

// Run the script
updateRoomImages().catch(console.error)