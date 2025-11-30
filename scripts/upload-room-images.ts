/**
 * Upload Room Images to Supabase Storage
 * Uploads room images from /public/images/rooms/ to room-images bucket
 * Matches images to correct room IDs from database
 * Updates database URLs after successful upload
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

// Load environment variables
function loadEnvSync() {
  try {
    const fs = require('fs');
    const envPath = join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      });
    }
  } catch (error) {
    // .env.local might not exist, that's okay
  }
}

loadEnvSync();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Room image mapping: filename -> room name pattern
const ROOM_IMAGE_MAPPING: Record<string, string[]> = {
  'dorm.webp': ['dorm', 'Dorm'],
  'room1.jpg': ['Room Nr 1', 'room 1', 'Room 1'],
  'room2.webp': ['Room Nr 2', 'room 2', 'Room 2'],
  'room3.webp': ['Room Nr 3', 'room 3', 'Room 3']
};

async function getRoomsFromDatabase() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT id, name, images 
      FROM rooms 
      WHERE is_active = true 
      ORDER BY name
    `);
    return result.rows;
  } finally {
    await client.end();
  }
}

function matchRoomToImage(roomName: string, fileName: string): boolean {
  const patterns = ROOM_IMAGE_MAPPING[fileName] || [];
  return patterns.some(pattern => 
    roomName.toLowerCase().includes(pattern.toLowerCase())
  );
}

async function uploadImageToSupabase(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

async function updateRoomImages(roomId: string, imageUrls: string[]) {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(
      'UPDATE rooms SET images = $1 WHERE id = $2',
      [imageUrls, roomId]
    );
    console.log(`  ✅ Updated database for room ${roomId}`);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🚀 Starting room image upload...\n');

  // Get rooms from database
  console.log('📥 Fetching rooms from database...');
  const rooms = await getRoomsFromDatabase();
  console.log(`✅ Found ${rooms.length} active rooms\n`);

  // Get room images from /public/images/rooms/
  const roomImagesDir = join(process.cwd(), 'public', 'images', 'rooms');
  const fsSync = require('fs');
  const imageFiles = fsSync.readdirSync(roomImagesDir).filter((f: string) => 
    f.match(/\.(jpg|jpeg|png|webp)$/i)
  );

  console.log(`📁 Found ${imageFiles.length} room images to upload\n`);

  const uploadResults: Array<{
    roomId: string;
    roomName: string;
    fileName: string;
    url: string;
    success: boolean;
    error?: string;
  }> = [];

  // Upload each image
  for (const fileName of imageFiles) {
    console.log(`\n📤 Uploading ${fileName}...`);
    
    // Find matching room
    const matchingRoom = rooms.find(room => 
      matchRoomToImage(room.name, fileName)
    );

    if (!matchingRoom) {
      console.warn(`  ⚠️  No matching room found for ${fileName}`);
      continue;
    }

    console.log(`  🎯 Matched to room: ${matchingRoom.name} (${matchingRoom.id})`);

    try {
      // Read file
      const filePath = join(roomImagesDir, fileName);
      const fileBuffer = await readFile(filePath);
      
      // Determine content type
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      const contentType = 
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.png' ? 'image/png' :
        ext === '.webp' ? 'image/webp' : 'image/jpeg';

      // Upload to Supabase
      const storagePath = `${matchingRoom.id}/${Date.now()}_${fileName}`;
      console.log(`  📤 Uploading to room-images/${storagePath}...`);
      
      const publicUrl = await uploadImageToSupabase(
        'room-images',
        storagePath,
        fileBuffer,
        contentType
      );

      console.log(`  ✅ Uploaded successfully: ${publicUrl}`);

      // Update database
      const currentImages = matchingRoom.images || [];
      const newImages = [...currentImages.filter((url: string) => 
        !url.includes(fileName)
      ), publicUrl];

      await updateRoomImages(matchingRoom.id, newImages);

      uploadResults.push({
        roomId: matchingRoom.id,
        roomName: matchingRoom.name,
        fileName,
        url: publicUrl,
        success: true
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Upload failed: ${errorMsg}`);
      uploadResults.push({
        roomId: matchingRoom.id,
        roomName: matchingRoom.name,
        fileName,
        url: '',
        success: false,
        error: errorMsg
      });
    }
  }

  // Summary
  console.log('\n\n📊 Upload Summary:');
  console.log('='.repeat(60));
  const successful = uploadResults.filter(r => r.success);
  const failed = uploadResults.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => {
    console.log(`  - ${r.fileName} → ${r.roomName}: ${r.url}`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach(r => {
      console.log(`  - ${r.fileName} → ${r.roomName}: ${r.error}`);
    });
  }

  // Save results
  const fsPromises = require('fs').promises;
  await fsPromises.writeFile(
    join(process.cwd(), 'scripts', 'room-upload-results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results: uploadResults }, null, 2)
  );

  console.log('\n✅ Results saved to scripts/room-upload-results.json');
}

main().catch(console.error);

