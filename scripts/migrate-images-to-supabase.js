#!/usr/bin/env node
/**
 * Main Image Migration Script
 * Uploads images from public/images to Supabase storage and updates database references
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const INVENTORY_FILE = path.join(__dirname, 'image-inventory.json');
const REFERENCE_MAP_FILE = path.join(__dirname, 'image-reference-map.json');
const MIGRATION_LOG_FILE = path.join(__dirname, 'image-migration-log.json');
const URL_MAPPING_FILE = path.join(__dirname, 'image-url-mapping.json');

const DRY_RUN = process.argv.includes('--dry-run');

// Load inventory and reference map
let inventory = {};
let referenceMap = {};
let urlMapping = {};
let migrationLog = {
  startTime: new Date().toISOString(),
  dryRun: DRY_RUN,
  uploaded: [],
  failed: [],
  skipped: [],
  databaseUpdates: []
};

function loadData() {
  if (fs.existsSync(INVENTORY_FILE)) {
    inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
  } else {
    console.error('❌ Inventory file not found. Run image-inventory.js first.');
    process.exit(1);
  }
  
  if (fs.existsSync(REFERENCE_MAP_FILE)) {
    referenceMap = JSON.parse(fs.readFileSync(REFERENCE_MAP_FILE, 'utf8'));
  } else {
    console.warn('⚠️  Reference map file not found. Run scan-database-image-references.js first.');
  }
  
  if (fs.existsSync(URL_MAPPING_FILE)) {
    urlMapping = JSON.parse(fs.readFileSync(URL_MAPPING_FILE, 'utf8'));
  }
}

function generateStoragePath(file, category) {
  const timestamp = Date.now();
  const filename = file.name;
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  
  // Generate path based on category
  let storagePath = '';
  
  switch (category) {
    case 'rooms':
      // Try to match with room ID from database
      const roomMatch = referenceMap.references?.find(r => 
        r.table === 'rooms' && 
        r.originalUrl && 
        r.originalUrl.includes(file.name)
      );
      if (roomMatch && roomMatch.recordData?.id) {
        storagePath = `${roomMatch.recordData.id}/${timestamp}_${filename}`;
      } else {
        storagePath = `general/${timestamp}_${filename}`;
      }
      break;
      
    case 'surfCamps':
      storagePath = `${timestamp}_${filename}`;
      break;
      
    case 'homepage':
      storagePath = `homepage/${timestamp}_${filename}`;
      break;
      
    case 'pageContent':
      // Try to determine page from filename
      let pageSlug = 'general';
      if (file.name.includes('play')) pageSlug = 'play';
      else if (file.name.includes('surf')) pageSlug = 'surf';
      else if (file.name.includes('yoga')) pageSlug = 'flow';
      else if (file.name.includes('skatepark') || file.name.includes('pool') || file.name.includes('park')) pageSlug = 'the-spot';
      storagePath = `${pageSlug}/${timestamp}_${filename}`;
      break;
      
    case 'videos':
      storagePath = `videos/${timestamp}_${filename}`;
      break;
      
    default:
      storagePath = `general/${timestamp}_${filename}`;
  }
  
  return storagePath;
}

async function uploadImage(file, category, bucket) {
  const filePath = path.join(__dirname, '..', 'public', 'images', file.relativePath);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Check if already uploaded (check URL mapping)
  const existingMapping = Object.values(urlMapping).find(m => 
    m.localPath === file.localPath || m.relativePath === file.relativePath
  );
  
  if (existingMapping && existingMapping.supabaseUrl) {
    console.log(`  ⏭️  Already uploaded: ${file.name}`);
    migrationLog.skipped.push({
      file: file.name,
      reason: 'Already uploaded',
      url: existingMapping.supabaseUrl
    });
    return existingMapping.supabaseUrl;
  }
  
  if (DRY_RUN) {
    const storagePath = generateStoragePath(file, category);
    const mockUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
    console.log(`  [DRY RUN] Would upload: ${file.name} → ${bucket}/${storagePath}`);
    return mockUrl;
  }
  
  // Read file
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = generateStoragePath(file, category);
  
  // Determine content type
  let contentType = 'image/jpeg';
  if (file.extension === '.webp') contentType = 'image/webp';
  else if (file.extension === '.png') contentType = 'image/png';
  else if (file.extension === '.gif') contentType = 'image/gif';
  else if (file.extension === '.svg') contentType = 'image/svg+xml';
  else if (file.extension === '.mp4') contentType = 'video/mp4';
  
  console.log(`  📤 Uploading: ${file.name} → ${bucket}/${storagePath}`);
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType: contentType,
      upsert: false
    });
  
  if (uploadError) {
    // Check if file already exists
    if (uploadError.message.includes('already exists') || uploadError.message.includes('duplicate')) {
      console.log(`  ⚠️  File already exists, getting URL...`);
      // Get existing URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);
      return publicUrl;
    }
    throw uploadError;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);
  
  console.log(`  ✅ Uploaded: ${publicUrl}`);
  
  return publicUrl;
}

async function uploadAllImages() {
  console.log('\n🚀 Starting image upload process...\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no actual uploads)' : 'LIVE (uploading to Supabase)'}\n`);
  
  const uploadResults = [];
  
  // Group by category for better organization
  const byCategory = {};
  inventory.files.forEach(file => {
    if (!byCategory[file.category]) {
      byCategory[file.category] = [];
    }
    byCategory[file.category].push(file);
  });
  
  // Upload by category
  for (const [category, files] of Object.entries(byCategory)) {
    console.log(`\n📦 Category: ${category} (${files.length} files)`);
    console.log('─'.repeat(60));
    
    for (const file of files) {
      try {
        const supabaseUrl = await uploadImage(file, file.category, file.bucket);
        
        uploadResults.push({
          file: file.name,
          localPath: file.localPath,
          relativePath: file.relativePath,
          category: file.category,
          bucket: file.bucket,
          supabaseUrl: supabaseUrl,
          uploadedAt: new Date().toISOString()
        });
        
        // Update URL mapping
        urlMapping[file.localPath] = {
          localPath: file.localPath,
          relativePath: file.relativePath,
          supabaseUrl: supabaseUrl,
          bucket: file.bucket,
          category: file.category
        };
        
        migrationLog.uploaded.push({
          file: file.name,
          url: supabaseUrl,
          bucket: file.bucket
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Failed: ${file.name} - ${error.message}`);
        migrationLog.failed.push({
          file: file.name,
          error: error.message
        });
      }
    }
  }
  
  // Save URL mapping
  if (!DRY_RUN) {
    fs.writeFileSync(URL_MAPPING_FILE, JSON.stringify(urlMapping, null, 2));
    console.log(`\n💾 URL mapping saved to: ${URL_MAPPING_FILE}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Upload Summary:\n');
  console.log(`✅ Uploaded: ${migrationLog.uploaded.length}`);
  console.log(`❌ Failed: ${migrationLog.failed.length}`);
  console.log(`⏭️  Skipped: ${migrationLog.skipped.length}`);
  
  return uploadResults;
}

// Main execution
if (require.main === module) {
  loadData();
  
  uploadAllImages()
    .then(() => {
      migrationLog.endTime = new Date().toISOString();
      fs.writeFileSync(MIGRATION_LOG_FILE, JSON.stringify(migrationLog, null, 2));
      console.log(`\n💾 Migration log saved to: ${MIGRATION_LOG_FILE}`);
      console.log('\n✨ Image upload process complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error.message);
      migrationLog.endTime = new Date().toISOString();
      migrationLog.fatalError = error.message;
      fs.writeFileSync(MIGRATION_LOG_FILE, JSON.stringify(migrationLog, null, 2));
      process.exit(1);
    });
}

module.exports = { uploadAllImages, generateStoragePath };

