#!/usr/bin/env node
/**
 * Database Image Reference Update Script
 * Updates all database tables to use new Supabase image URLs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const URL_MAPPING_FILE = path.join(__dirname, 'image-url-mapping.json');
const REFERENCE_MAP_FILE = path.join(__dirname, 'image-reference-map.json');
const UPDATE_LOG_FILE = path.join(__dirname, 'database-update-log.json');

const DRY_RUN = process.argv.includes('--dry-run');
const OLD_SUPABASE_URL = 'zejrhceuuujzgyukdwnb.supabase.co';
const NEW_SUPABASE_URL = 'pguipwhrxdzzrndbluxb.supabase.co';

let urlMapping = {};
let referenceMap = {};
let updateLog = {
  startTime: new Date().toISOString(),
  dryRun: DRY_RUN,
  updates: [],
  errors: []
};

function loadData() {
  if (fs.existsSync(URL_MAPPING_FILE)) {
    urlMapping = JSON.parse(fs.readFileSync(URL_MAPPING_FILE, 'utf8'));
  } else {
    console.error('❌ URL mapping file not found. Run migrate-images-to-supabase.js first.');
    process.exit(1);
  }
  
  if (fs.existsSync(REFERENCE_MAP_FILE)) {
    referenceMap = JSON.parse(fs.readFileSync(REFERENCE_MAP_FILE, 'utf8'));
  }
}

function findNewUrl(oldUrl) {
  if (!oldUrl) return null;
  
  // Check URL mapping first (for local paths)
  const mapping = Object.values(urlMapping).find(m => 
    m.localPath === oldUrl || 
    m.relativePath === oldUrl ||
    oldUrl.includes(m.relativePath) ||
    oldUrl.endsWith(m.relativePath.replace('/images/', ''))
  );
  
  if (mapping && mapping.supabaseUrl) {
    return mapping.supabaseUrl;
  }
  
  // Replace old Supabase URL with new one
  if (oldUrl.includes(OLD_SUPABASE_URL)) {
    return oldUrl.replace(OLD_SUPABASE_URL, NEW_SUPABASE_URL);
  }
  
  // If it's already a new Supabase URL, return as-is
  if (oldUrl.includes(NEW_SUPABASE_URL)) {
    return oldUrl;
  }
  
  return null;
}

function replaceUrlInArray(urls, oldUrl, newUrl) {
  if (!Array.isArray(urls)) return urls;
  return urls.map(url => {
    if (url === oldUrl || url.includes(oldUrl)) {
      return newUrl;
    }
    // Also check for partial matches (filename-based)
    const oldFilename = path.basename(oldUrl);
    const urlFilename = path.basename(url);
    if (oldFilename === urlFilename && url.startsWith('/images/')) {
      return newUrl;
    }
    return url;
  });
}

function replaceUrlInJsonb(jsonbData, oldUrl, newUrl) {
  if (!jsonbData || typeof jsonbData !== 'object') return jsonbData;
  
  const jsonString = JSON.stringify(jsonbData);
  let updated = jsonString;
  
  // Replace old URL
  updated = updated.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
  
  // Also try replacing by filename
  const oldFilename = path.basename(oldUrl);
  const urlMatches = jsonString.match(new RegExp(`/images/[^"']*${oldFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*`, 'g'));
  if (urlMatches) {
    urlMatches.forEach(match => {
      updated = updated.replace(match, newUrl);
    });
  }
  
  try {
    return JSON.parse(updated);
  } catch {
    return jsonbData; // Return original if parsing fails
  }
}

async function updateRoomsTable() {
  console.log('\n🏠 Updating rooms table...');
  
  const roomReferences = (referenceMap.references || []).filter(r => r.table === 'rooms');
  
  if (roomReferences.length === 0) {
    console.log('  ℹ️  No room references found');
    return;
  }
  
  // Group by room ID
  const byRoomId = {};
  roomReferences.forEach(ref => {
    const roomId = ref.recordData?.id;
    if (!roomId) return;
    
    if (!byRoomId[roomId]) {
      byRoomId[roomId] = {
        id: roomId,
        name: ref.recordData?.name || 'Unknown',
        oldUrls: [],
        newUrls: []
      };
    }
    
    if (ref.originalUrl && !byRoomId[roomId].oldUrls.includes(ref.originalUrl)) {
      byRoomId[roomId].oldUrls.push(ref.originalUrl);
      
      const newUrl = findNewUrl(ref.originalUrl);
      if (newUrl && !byRoomId[roomId].newUrls.includes(newUrl)) {
        byRoomId[roomId].newUrls.push(newUrl);
      }
    }
  });
  
  for (const [roomId, roomData] of Object.entries(byRoomId)) {
    if (roomData.newUrls.length === 0) {
      console.log(`  ⚠️  No new URL found for room: ${roomData.name}`);
      continue;
    }
    
    console.log(`  📝 Updating room: ${roomData.name}`);
    console.log(`     Old: ${roomData.oldUrls.join(', ')}`);
    console.log(`     New: ${roomData.newUrls.join(', ')}`);
    
    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would update room ${roomId}`);
      updateLog.updates.push({
        table: 'rooms',
        recordId: roomId,
        field: 'images',
        oldValue: roomData.oldUrls,
        newValue: roomData.newUrls,
        status: 'dry-run'
      });
      continue;
    }
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          images: roomData.newUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (error) {
        throw error;
      }
      
      console.log(`  ✅ Updated successfully`);
      updateLog.updates.push({
        table: 'rooms',
        recordId: roomId,
        field: 'images',
        oldValue: roomData.oldUrls,
        newValue: roomData.newUrls,
        status: 'success'
      });
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      updateLog.errors.push({
        table: 'rooms',
        recordId: roomId,
        error: error.message
      });
    }
  }
}

async function updatePageContentTable() {
  console.log('\n📄 Updating page_content table...');
  
  const pageReferences = (referenceMap.references || []).filter(r => r.table === 'page_content');
  
  if (pageReferences.length === 0) {
    console.log('  ℹ️  No page_content references found');
    return;
  }
  
  // Group by record ID since JSONB fields can have multiple URLs
  const byRecordId = {};
  pageReferences.forEach(ref => {
    const recordId = ref.recordData?.id;
    if (!recordId) return;
    
    if (!byRecordId[recordId]) {
      byRecordId[recordId] = {
        id: recordId,
        pageSlug: ref.recordData?.page_slug,
        section: ref.recordData?.section,
        fields: {}
      };
    }
    
    const fieldName = ref.field;
    if (!byRecordId[recordId].fields[fieldName]) {
      byRecordId[recordId].fields[fieldName] = {
        isJsonb: ref.field === 'json_content',
        urls: []
      };
    }
    
    const oldUrl = ref.originalUrl;
    const newUrl = findNewUrl(oldUrl);
    
    if (newUrl) {
      byRecordId[recordId].fields[fieldName].urls.push({ old: oldUrl, new: newUrl });
    } else {
      console.log(`  ⚠️  No new URL found for: ${oldUrl} (will skip)`);
    }
  });
  
  // Fetch current records to update JSONB properly
  for (const [recordId, recordData] of Object.entries(byRecordId)) {
    try {
      // Fetch current record
      const { data: currentRecord, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (fetchError || !currentRecord) {
        console.log(`  ⚠️  Could not fetch record ${recordId}: ${fetchError?.message || 'not found'}`);
        continue;
      }
      
      const updateData = { updated_at: new Date().toISOString() };
      let hasUpdates = false;
      
      // Update each field
      for (const [fieldName, fieldData] of Object.entries(recordData.fields)) {
        if (fieldData.urls.length === 0) continue;
        
        if (fieldData.isJsonb) {
          // Handle JSONB field - replace URLs within JSON structure
          let jsonContent = currentRecord[fieldName] || {};
          
          fieldData.urls.forEach(({ old, new: newUrl }) => {
            const jsonString = JSON.stringify(jsonContent);
            if (jsonString.includes(old)) {
              const updated = jsonString.replace(
                new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                newUrl
              );
              try {
                jsonContent = JSON.parse(updated);
                hasUpdates = true;
              } catch (e) {
                console.log(`  ⚠️  Failed to parse JSON after replacement: ${e.message}`);
              }
            }
          });
          
          updateData[fieldName] = jsonContent;
        } else {
          // Simple VARCHAR field - use first URL replacement
          const firstUrl = fieldData.urls[0];
          updateData[fieldName] = firstUrl.new;
          hasUpdates = true;
        }
      }
      
      if (!hasUpdates) {
        console.log(`  ℹ️  No updates needed for record ${recordId}`);
        continue;
      }
      
      console.log(`  📝 Updating page_content record: ${recordId} (${recordData.pageSlug}/${recordData.section})`);
      Object.entries(recordData.fields).forEach(([fieldName, fieldData]) => {
        fieldData.urls.forEach(({ old, new: newUrl }) => {
          console.log(`     ${fieldName}: ${old} → ${newUrl}`);
        });
      });
      
      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would update record ${recordId}`);
        updateLog.updates.push({
          table: 'page_content',
          recordId: recordId,
          fields: updateData,
          status: 'dry-run'
        });
        continue;
      }
      
      const { error: updateError } = await supabase
        .from('page_content')
        .update(updateData)
        .eq('id', recordId);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`  ✅ Updated successfully`);
      updateLog.updates.push({
        table: 'page_content',
        recordId: recordId,
        fields: updateData,
        status: 'success'
      });
    } catch (error) {
      console.error(`  ❌ Error updating record ${recordId}: ${error.message}`);
      updateLog.errors.push({
        table: 'page_content',
        recordId: recordId,
        error: error.message
      });
    }
  }
}

async function updateAllTables() {
  console.log('\n🔄 Starting database updates...\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no actual updates)' : 'LIVE (updating database)'}\n`);
  
  await updateRoomsTable();
  await updatePageContentTable();
  
  // Add more table update functions as needed
  // await updateSurfCampsTable();
  // await updateHomepageSectionsTable();
  // etc.
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Update Summary:\n');
  console.log(`✅ Updated: ${updateLog.updates.filter(u => u.status === 'success').length}`);
  console.log(`❌ Errors: ${updateLog.errors.length}`);
  if (DRY_RUN) {
    console.log(`🔍 Dry run records: ${updateLog.updates.filter(u => u.status === 'dry-run').length}`);
  }
}

// Main execution
if (require.main === module) {
  loadData();
  
  updateAllTables()
    .then(() => {
      updateLog.endTime = new Date().toISOString();
      fs.writeFileSync(UPDATE_LOG_FILE, JSON.stringify(updateLog, null, 2));
      console.log(`\n💾 Update log saved to: ${UPDATE_LOG_FILE}`);
      console.log('\n✨ Database update process complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error.message);
      updateLog.endTime = new Date().toISOString();
      updateLog.fatalError = error.message;
      fs.writeFileSync(UPDATE_LOG_FILE, JSON.stringify(updateLog, null, 2));
      process.exit(1);
    });
}

module.exports = { updateAllTables, findNewUrl };

