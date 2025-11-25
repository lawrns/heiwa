#!/usr/bin/env node
/**
 * Image Migration Verification Script
 * Verifies that all images are uploaded and database references are updated
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const URL_MAPPING_FILE = path.join(__dirname, 'image-url-mapping.json');
const REFERENCE_MAP_FILE = path.join(__dirname, 'image-reference-map.json');
const VERIFICATION_REPORT_FILE = path.join(__dirname, '..', 'IMAGE_MIGRATION_REPORT.md');

const OLD_SUPABASE_URL = 'zejrhceuuujzgyukdwnb.supabase.co';
const NEW_SUPABASE_URL = 'pguipwhrxdzzrndbluxb.supabase.co';

let urlMapping = {};
let referenceMap = {};
let verificationReport = {
  verificationDate: new Date().toISOString(),
  summary: {
    totalImagesUploaded: 0,
    totalDatabaseReferences: 0,
    updatedReferences: 0,
    brokenLinks: 0,
    oldUrlsRemaining: 0,
    localPathsRemaining: 0
  },
  uploadedImages: [],
  databaseChecks: [],
  brokenLinks: [],
  issues: []
};

async function verifyImageExists(url) {
  try {
    // Extract bucket and path from URL
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match) return { exists: false, error: 'Invalid URL format' };
    
    const [, bucket, filePath] = match;
    
    // Check if file exists in storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });
    
    if (error) {
      return { exists: false, error: error.message };
    }
    
    const fileExists = data && data.some(file => file.name === filePath.split('/').pop());
    return { exists: fileExists, error: fileExists ? null : 'File not found in storage' };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function verifyDatabaseReferences() {
  console.log('\n🔍 Verifying database references...\n');
  
  const tables = [
    { name: 'rooms', field: 'images', isArray: true },
    { name: 'page_content', field: 'image_url', isArray: false },
    { name: 'page_content', field: 'json_content', isJsonb: true }
  ];
  
  for (const tableConfig of tables) {
    try {
      const { data, error } = await supabase
        .from(tableConfig.name)
        .select('*')
        .limit(1000);
      
      if (error) {
        console.log(`  ⚠️  Error querying ${tableConfig.name}: ${error.message}`);
        continue;
      }
      
      (data || []).forEach(record => {
        const fieldValue = record[tableConfig.field];
        
        if (!fieldValue) return;
        
        let urls = [];
        if (tableConfig.isArray && Array.isArray(fieldValue)) {
          urls = fieldValue;
        } else if (tableConfig.isJsonb && typeof fieldValue === 'object') {
          const jsonString = JSON.stringify(fieldValue);
          const urlMatches = jsonString.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp|gif|svg|mp4)/gi);
          if (urlMatches) urls = urlMatches;
        } else if (typeof fieldValue === 'string') {
          urls = [fieldValue];
        }
        
        urls.forEach(url => {
          verificationReport.summary.totalDatabaseReferences++;
          
          // Check for old URLs
          if (url.includes(OLD_SUPABASE_URL)) {
            verificationReport.summary.oldUrlsRemaining++;
            verificationReport.issues.push({
              type: 'old_supabase_url',
              table: tableConfig.name,
              recordId: record.id,
              url: url
            });
          }
          
          // Check for local paths
          if (url.startsWith('/images/')) {
            verificationReport.summary.localPathsRemaining++;
            verificationReport.issues.push({
              type: 'local_path',
              table: tableConfig.name,
              recordId: record.id,
              url: url
            });
          }
          
          // Check if URL is new Supabase URL
          if (url.includes(NEW_SUPABASE_URL)) {
            verificationReport.summary.updatedReferences++;
          }
        });
      });
      
      console.log(`  ✅ Checked ${tableConfig.name}: ${data?.length || 0} records`);
    } catch (error) {
      console.log(`  ❌ Error checking ${tableConfig.name}: ${error.message}`);
    }
  }
}

async function verifyUploadedImages() {
  console.log('\n🔍 Verifying uploaded images...\n');
  
  if (!fs.existsSync(URL_MAPPING_FILE)) {
    console.log('  ⚠️  URL mapping file not found');
    return;
  }
  
  urlMapping = JSON.parse(fs.readFileSync(URL_MAPPING_FILE, 'utf8'));
  
  const mappings = Object.values(urlMapping);
  verificationReport.summary.totalImagesUploaded = mappings.length;
  
  console.log(`  Checking ${mappings.length} uploaded images...\n`);
  
  let checked = 0;
  for (const mapping of mappings) {
    checked++;
    if (checked % 10 === 0) {
      process.stdout.write(`  Progress: ${checked}/${mappings.length}\r`);
    }
    
    const result = await verifyImageExists(mapping.supabaseUrl);
    
    if (!result.exists) {
      verificationReport.summary.brokenLinks++;
      verificationReport.brokenLinks.push({
        localPath: mapping.localPath,
        supabaseUrl: mapping.supabaseUrl,
        error: result.error
      });
    } else {
      verificationReport.uploadedImages.push({
        localPath: mapping.localPath,
        supabaseUrl: mapping.supabaseUrl,
        bucket: mapping.bucket,
        category: mapping.category
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n  ✅ Verified ${mappings.length} images`);
}

function generateReport() {
  const report = `# Image Migration Report

**Verification Date:** ${verificationReport.verificationDate}

## Summary

- **Total Images Uploaded:** ${verificationReport.summary.totalImagesUploaded}
- **Total Database References:** ${verificationReport.summary.totalDatabaseReferences}
- **Updated References:** ${verificationReport.summary.updatedReferences}
- **Broken Links:** ${verificationReport.summary.brokenLinks}
- **Old Supabase URLs Remaining:** ${verificationReport.summary.oldUrlsRemaining}
- **Local Paths Remaining:** ${verificationReport.summary.localPathsRemaining}

## Status

${verificationReport.summary.brokenLinks === 0 && 
  verificationReport.summary.oldUrlsRemaining === 0 && 
  verificationReport.summary.localPathsRemaining === 0 
  ? '✅ **Migration Successful** - All images uploaded and references updated' 
  : '⚠️ **Migration Incomplete** - Some issues found (see below)'}

## Issues

${verificationReport.issues.length === 0 ? 'None' : verificationReport.issues.map(issue => 
  `- **${issue.type}** in ${issue.table} (record ${issue.recordId}): ${issue.url}`
).join('\n')}

## Broken Links

${verificationReport.brokenLinks.length === 0 ? 'None' : verificationReport.brokenLinks.map(link => 
  `- ${link.localPath} → ${link.supabaseUrl} (${link.error})`
).join('\n')}

## Images by Category

${Object.entries(
  verificationReport.uploadedImages.reduce((acc, img) => {
    acc[img.category] = (acc[img.category] || 0) + 1;
    return acc;
  }, {})
).map(([cat, count]) => `- **${cat}**: ${count} images`).join('\n')}

## Next Steps

${verificationReport.summary.brokenLinks > 0 ? 
  '1. Investigate and fix broken image links\n' : ''}
${verificationReport.summary.oldUrlsRemaining > 0 ? 
  '2. Update remaining old Supabase URLs\n' : ''}
${verificationReport.summary.localPathsRemaining > 0 ? 
  '3. Update remaining local path references\n' : ''}
${verificationReport.summary.brokenLinks === 0 && 
  verificationReport.summary.oldUrlsRemaining === 0 && 
  verificationReport.summary.localPathsRemaining === 0 ? 
  '✅ Migration complete! All images are uploaded and references are updated.' : ''}
`;

  fs.writeFileSync(VERIFICATION_REPORT_FILE, report);
  console.log(`\n💾 Report saved to: ${VERIFICATION_REPORT_FILE}\n`);
}

async function runVerification() {
  console.log('🔍 Starting image migration verification...\n');
  
  if (fs.existsSync(REFERENCE_MAP_FILE)) {
    referenceMap = JSON.parse(fs.readFileSync(REFERENCE_MAP_FILE, 'utf8'));
  }
  
  await verifyUploadedImages();
  await verifyDatabaseReferences();
  generateReport();
  
  console.log('='.repeat(60));
  console.log('\n📊 Verification Summary:\n');
  console.log(`✅ Images Uploaded: ${verificationReport.summary.totalImagesUploaded}`);
  console.log(`📝 Database References: ${verificationReport.summary.totalDatabaseReferences}`);
  console.log(`✅ Updated References: ${verificationReport.summary.updatedReferences}`);
  console.log(`❌ Broken Links: ${verificationReport.summary.brokenLinks}`);
  console.log(`⚠️  Old URLs Remaining: ${verificationReport.summary.oldUrlsRemaining}`);
  console.log(`⚠️  Local Paths Remaining: ${verificationReport.summary.localPathsRemaining}`);
  console.log('\n✨ Verification complete!');
}

// Main execution
if (require.main === module) {
  runVerification()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { runVerification };

