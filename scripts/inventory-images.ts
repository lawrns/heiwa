/**
 * Image Inventory Script
 * Lists all images in /public/images and categorizes them by type
 * Checks which images already exist in Supabase storage
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
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

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('Please set it in .env.local file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface ImageInfo {
  localPath: string;
  relativePath: string;
  fileName: string;
  category: 'room' | 'surf-camp' | 'page' | 'general' | 'yoga-dome' | 'unknown';
  intendedBucket: string;
  size: number;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const PUBLIC_IMAGES_DIR = join(process.cwd(), 'public', 'images');

async function getAllImages(dir: string, baseDir: string = PUBLIC_IMAGES_DIR): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = fullPath.replace(baseDir + '/', '');
      
      if (entry.isDirectory()) {
        const subImages = await getAllImages(fullPath, baseDir);
        images.push(...subImages);
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().substring(entry.name.lastIndexOf('.'));
        if (IMAGE_EXTENSIONS.includes(ext)) {
          const stats = await stat(fullPath);
          
          // Categorize image
          let category: ImageInfo['category'] = 'unknown';
          let intendedBucket = 'cms-media';
          
          if (relativePath.includes('rooms/') || entry.name.match(/room[123]|dorm/i)) {
            category = 'room';
            intendedBucket = 'room-images';
          } else if (relativePath.includes('yoga_dome') || entry.name.includes('yoga_dome')) {
            category = 'yoga-dome';
            intendedBucket = 'page-images';
          } else if (entry.name.match(/surf/i)) {
            category = 'surf-camp';
            intendedBucket = 'surf-camp-images';
          } else if (relativePath.includes('posters/') || relativePath.includes('hero/')) {
            category = 'page';
            intendedBucket = 'page-images';
          } else {
            category = 'general';
            intendedBucket = 'cms-media';
          }
          
          images.push({
            localPath: fullPath,
            relativePath,
            fileName: entry.name,
            category,
            intendedBucket,
            size: stats.size
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return images;
}

async function checkSupabaseStorage() {
  console.log('📦 Checking Supabase storage buckets...');
  
  const buckets = ['room-images', 'surf-camp-images', 'add-on-images', 'page-images', 'cms-media'];
  const storageFiles: Record<string, string[]> = {};
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabaseAdmin.storage.from(bucket).list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });
      
      if (error) {
        console.warn(`⚠️  Error listing ${bucket}:`, error.message);
        storageFiles[bucket] = [];
      } else {
        const files = data?.map(f => f.name) || [];
        storageFiles[bucket] = files;
        console.log(`✅ ${bucket}: ${files.length} files`);
      }
    } catch (error) {
      console.error(`❌ Error checking ${bucket}:`, error);
      storageFiles[bucket] = [];
    }
  }
  
  return storageFiles;
}

async function main() {
  console.log('🔍 Starting image inventory...\n');
  
  // Get all local images
  console.log('📁 Scanning /public/images directory...');
  const localImages = await getAllImages(PUBLIC_IMAGES_DIR);
  console.log(`✅ Found ${localImages.length} images\n`);
  
  // Check Supabase storage
  const storageFiles = await checkSupabaseStorage();
  
  // Categorize images
  const categorized: Record<string, ImageInfo[]> = {
    room: [],
    'surf-camp': [],
    page: [],
    general: [],
    'yoga-dome': [],
    unknown: []
  };
  
  localImages.forEach(img => {
    categorized[img.category].push(img);
  });
  
  // Print summary
  console.log('\n📊 Image Inventory Summary:');
  console.log('='.repeat(60));
  Object.entries(categorized).forEach(([category, images]) => {
    if (images.length > 0) {
      console.log(`\n${category.toUpperCase()} (${images.length} images) → ${images[0].intendedBucket}:`);
      images.forEach(img => {
        const existsInStorage = storageFiles[img.intendedBucket]?.some(f => 
          f.includes(img.fileName) || f.endsWith(img.fileName)
        );
        const status = existsInStorage ? '✅' : '❌';
        console.log(`  ${status} ${img.relativePath} (${(img.size / 1024).toFixed(1)} KB)`);
      });
    }
  });
  
  // Room images detail
  console.log('\n\n🏠 Room Images Detail:');
  console.log('='.repeat(60));
  const roomImages = categorized.room;
  if (roomImages.length > 0) {
    roomImages.forEach(img => {
      console.log(`  ${img.fileName} → ${img.intendedBucket}`);
      console.log(`    Path: ${img.relativePath}`);
      console.log(`    Size: ${(img.size / 1024).toFixed(1)} KB`);
    });
  } else {
    console.log('  No room images found in /public/images/rooms/');
  }
  
  // Check for yoga dome contamination
  console.log('\n\n🚨 Checking for Yoga Dome Contamination:');
  console.log('='.repeat(60));
  const yogaDomeInRooms = storageFiles['room-images']?.filter(f => 
    f.includes('yoga_dome') || f.includes('yoga-dome')
  ) || [];
  
  if (yogaDomeInRooms.length > 0) {
    console.error(`❌ FOUND ${yogaDomeInRooms.length} YOGA DOME IMAGES IN room-images BUCKET!`);
    yogaDomeInRooms.forEach(f => console.error(`  - ${f}`));
  } else {
    console.log('✅ No yoga dome images found in room-images bucket');
  }
  
  // Save inventory to JSON
  const inventory = {
    timestamp: new Date().toISOString(),
    localImages: localImages.map(img => ({
      localPath: img.localPath,
      relativePath: img.relativePath,
      fileName: img.fileName,
      category: img.category,
      intendedBucket: img.intendedBucket,
      size: img.size
    })),
    storageFiles,
    summary: {
      totalLocalImages: localImages.length,
      byCategory: Object.fromEntries(
        Object.entries(categorized).map(([cat, imgs]) => [cat, imgs.length])
      ),
      yogaDomeContamination: yogaDomeInRooms.length
    }
  };
  
  const fs = await import('fs/promises');
  await fs.writeFile(
    join(process.cwd(), 'scripts', 'image-inventory.json'),
    JSON.stringify(inventory, null, 2)
  );
  
  console.log('\n✅ Inventory saved to scripts/image-inventory.json');
}

main().catch(console.error);

