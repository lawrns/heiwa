/**
 * Fix Database Image URLs
 * Removes invalid URLs, fixes bucket names, removes yoga dome URLs from rooms
 */

import { Client } from 'pg';

// Load environment variables
function loadEnvSync() {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line: string) => {
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

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

function fixImageUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Remove yoga dome images
  if (url.includes('yoga_dome') || url.includes('yoga-dome')) {
    return null;
  }
  
  // Fix bucket name: /rooms/ -> /room-images/
  if (url.includes('/storage/v1/object/public/rooms/') && !url.includes('/room-images/')) {
    return url.replace('/storage/v1/object/public/rooms/', '/storage/v1/object/public/room-images/');
  }
  
  return url;
}

async function fixRoomsTable() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all rooms
    const result = await client.query(`
      SELECT id, name, images 
      FROM rooms 
      WHERE is_active = true
    `);

    console.log(`📋 Found ${result.rows.length} active rooms\n`);

    for (const room of result.rows) {
      const originalImages = room.images || [];
      const fixedImages = originalImages
        .map((url: string) => fixImageUrl(url))
        .filter((url: string | null) => url !== null);

      // Check if changes needed
      const hasChanges = 
        fixedImages.length !== originalImages.length ||
        fixedImages.some((url: string, i: number) => url !== originalImages[i]);

      if (hasChanges) {
        console.log(`🔧 Fixing room: ${room.name}`);
        console.log(`  Before: ${originalImages.length} images`);
        console.log(`  After: ${fixedImages.length} images`);
        
        if (originalImages.length !== fixedImages.length) {
          const removed = originalImages.filter((url: string) => 
            !fixedImages.includes(url)
          );
          removed.forEach((url: string) => {
            if (url.includes('yoga')) {
              console.log(`    ❌ Removed yoga dome: ${url}`);
            } else {
              console.log(`    ❌ Removed invalid: ${url}`);
            }
          });
        }

        await client.query(
          'UPDATE rooms SET images = $1 WHERE id = $2',
          [fixedImages, room.id]
        );
        console.log(`  ✅ Updated\n`);
      } else {
        console.log(`✅ Room "${room.name}" - no changes needed\n`);
      }
    }

    console.log('✅ All rooms processed');
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🔧 Starting database URL fixes...\n');
  await fixRoomsTable();
  console.log('\n✅ Database URL fixes complete');
}

main().catch(console.error);

