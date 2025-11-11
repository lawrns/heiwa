const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Room images mapping
const roomImages = [
  {
    name: 'Dorm room',
    id: 'f3f00cbb-c30e-4d84-9352-cfb6a76684d0',
    localPath: '/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/public/dorm.webp',
    fileName: 'dorm.webp'
  },
  {
    name: 'Room Nr 2',
    id: 'ac98fd46-5bd2-413c-98f3-17e71024e734',
    localPath: '/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/public/room2.webp',
    fileName: 'room2.webp'
  },
  {
    name: 'Room Nr 3',
    id: '6a6e6bb0-d3e5-4fab-87d8-7e39174637e9',
    localPath: '/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/public/room3.webp',
    fileName: 'room3.webp'
  }
];

async function uploadRoomImages() {
  console.log('🚀 Starting room image upload to Supabase...\n');

  for (const room of roomImages) {
    try {
      console.log(`📤 Uploading image for: ${room.name}`);

      // Check if file exists
      if (!fs.existsSync(room.localPath)) {
        console.log(`   ❌ File not found: ${room.localPath}`);
        continue;
      }

      // Read the file
      const fileBuffer = fs.readFileSync(room.localPath);
      const fileExt = path.extname(room.fileName);
      const timestamp = Date.now();
      const storagePath = `${room.id}/${timestamp}_${room.fileName}`;

      console.log(`   📁 Uploading to: rooms/${storagePath}`);

      // Upload to Supabase Storage (rooms bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rooms')
        .upload(storagePath, fileBuffer, {
          contentType: fileExt === '.webp' ? 'image/webp' : 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.log(`   ❌ Upload failed: ${uploadError.message}`);
        continue;
      }

      console.log(`   ✅ Uploaded successfully!`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rooms')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;
      console.log(`   🔗 Public URL: ${publicUrl}`);

      // Update database
      console.log(`   💾 Updating database...`);
      const { data: updateData, error: updateError } = await supabase
        .from('rooms')
        .update({
          images: [publicUrl],
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);

      if (updateError) {
        console.log(`   ❌ Database update failed: ${updateError.message}`);
        continue;
      }

      console.log(`   ✅ Database updated!`);
      console.log('');

    } catch (error) {
      console.log(`   ❌ Error processing ${room.name}:`, error.message);
      console.log('');
    }
  }

  console.log('🎉 Upload process completed!\n');

  // Verify the results
  console.log('🔍 Verifying database updates...\n');
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, name, images')
    .in('id', roomImages.map(r => r.id));

  if (error) {
    console.log('❌ Failed to verify:', error.message);
    return;
  }

  rooms.forEach(room => {
    const hasSupabaseUrl = room.images && room.images[0] && room.images[0].includes('supabase.co');
    console.log(`${hasSupabaseUrl ? '✅' : '❌'} ${room.name}: ${room.images?.[0] || 'NO IMAGE'}`);
  });
}

// Run the upload
uploadRoomImages()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
