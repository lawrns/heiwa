#!/usr/bin/env node
/**
 * Database Image Reference Scanner
 * Scans all database tables for image references and creates mapping
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const OUTPUT_FILE = path.join(__dirname, 'image-reference-map.json');

const OLD_SUPABASE_URL = 'zejrhceuuujzgyukdwnb.supabase.co';
const NEW_SUPABASE_URL = 'pguipwhrxdzzrndbluxb.supabase.co';

function extractImageUrls(data, fieldName, isArray = false) {
  const urls = [];
  
  if (!data) return urls;
  
  if (isArray && Array.isArray(data)) {
    data.forEach(item => {
      if (typeof item === 'string' && (item.includes('/images/') || item.includes('.supabase.co'))) {
        urls.push(item);
      }
    });
  } else if (typeof data === 'string' && (data.includes('/images/') || data.includes('.supabase.co'))) {
    urls.push(data);
  } else if (typeof data === 'object' && data !== null) {
    // Handle JSONB fields
    const jsonString = JSON.stringify(data);
    const urlMatches = jsonString.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|webp|gif|svg|mp4)/gi);
    if (urlMatches) {
      urls.push(...urlMatches);
    }
    // Also check for local paths
    const localPathMatches = jsonString.match(/\/images\/[^\s"']+/gi);
    if (localPathMatches) {
      urls.push(...localPathMatches);
    }
  }
  
  return urls;
}

function categorizeUrl(url) {
  if (!url) return null;
  
  if (url.startsWith('/images/')) {
    return { type: 'local', path: url };
  } else if (url.includes(OLD_SUPABASE_URL)) {
    return { type: 'old_supabase', url: url };
  } else if (url.includes(NEW_SUPABASE_URL)) {
    return { type: 'new_supabase', url: url };
  } else if (url.startsWith('http')) {
    return { type: 'external', url: url };
  }
  
  return { type: 'unknown', url: url };
}

async function scanTable(tableName, config) {
  try {
    console.log(`  Scanning ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(10000); // Adjust if needed
    
    if (error) {
      console.log(`    ⚠️  Error: ${error.message}`);
      return [];
    }
    
    const references = [];
    
    (data || []).forEach((row, index) => {
      config.fields.forEach(field => {
        const fieldData = row[field.name];
        const urls = extractImageUrls(fieldData, field.name, field.isArray || field.isJsonb);
        
        urls.forEach(url => {
          const categorized = categorizeUrl(url);
          references.push({
            table: tableName,
            recordId: row.id || `row_${index}`,
            field: field.name,
            originalUrl: url,
            category: categorized,
            recordData: {
              // Store minimal record data for context
              id: row.id,
              ...(field.contextFields ? 
                Object.fromEntries(field.contextFields.map(f => [f, row[f]])) : 
                {}
              )
            }
          });
        });
      });
    });
    
    console.log(`    ✅ Found ${references.length} image references`);
    return references;
  } catch (error) {
    console.log(`    ❌ Exception: ${error.message}`);
    return [];
  }
}

async function scanDatabase() {
  console.log('🔍 Scanning database for image references...\n');
  
  const tables = [
    {
      name: 'rooms',
      fields: [
        { name: 'images', isArray: true, contextFields: ['name', 'id'] }
      ]
    },
    {
      name: 'surf_camps',
      fields: [
        { name: 'image_url', contextFields: ['name', 'id'] },
        { name: 'images', isArray: true, contextFields: ['name', 'id'] },
        { name: 'cover_image', contextFields: ['name', 'id'] }
      ]
    },
    {
      name: 'homepage_sections',
      fields: [
        { name: 'background_image', contextFields: ['section_type', 'id'] },
        { name: 'content', isJsonb: true, contextFields: ['section_type', 'id'] }
      ]
    },
    {
      name: 'homepage_content',
      fields: [
        { name: 'content', isJsonb: true, contextFields: ['section', 'id'] }
      ]
    },
    {
      name: 'page_content',
      fields: [
        { name: 'image_url', contextFields: ['page_slug', 'section', 'id'] },
        { name: 'json_content', isJsonb: true, contextFields: ['page_slug', 'section', 'id'] }
      ]
    },
    {
      name: 'testimonials',
      fields: [
        { name: 'image_url', contextFields: ['author_name', 'id'] }
      ]
    },
    {
      name: 'media_library',
      fields: [
        { name: 'public_url', contextFields: ['filename', 'id'] },
        { name: 'supabase_path', contextFields: ['filename', 'id'] }
      ]
    },
    {
      name: 'blog_post_translations',
      fields: [
        { name: 'cover_image_url', contextFields: ['post_id', 'locale', 'id'] },
        { name: 'body_rich', isJsonb: true, contextFields: ['post_id', 'locale', 'id'] }
      ]
    },
    {
      name: 'blog_authors',
      fields: [
        { name: 'avatar_url', contextFields: ['name', 'id'] }
      ]
    },
    {
      name: 'gallery',
      fields: [
        { name: 'url', contextFields: ['filename', 'id'] },
        { name: 'thumbnail_url', contextFields: ['filename', 'id'] }
      ]
    }
  ];
  
  const allReferences = [];
  const summary = {
    scanDate: new Date().toISOString(),
    totalReferences: 0,
    byType: {
      local: 0,
      old_supabase: 0,
      new_supabase: 0,
      external: 0,
      unknown: 0
    },
    byTable: {},
    references: []
  };
  
  for (const tableConfig of tables) {
    const references = await scanTable(tableConfig.name, tableConfig);
    allReferences.push(...references);
    
    // Update summary
    if (!summary.byTable[tableConfig.name]) {
      summary.byTable[tableConfig.name] = 0;
    }
    summary.byTable[tableConfig.name] += references.length;
    
    // Small delay between queries
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Categorize references
  allReferences.forEach(ref => {
    summary.totalReferences++;
    const type = ref.category.type;
    if (summary.byType[type] !== undefined) {
      summary.byType[type]++;
    } else {
      summary.byType.unknown++;
    }
  });
  
  summary.references = allReferences;
  
  // Print summary
  console.log('\n📊 Database Scan Summary:\n');
  console.log(`Total References: ${summary.totalReferences}`);
  console.log('\nBy Type:');
  Object.entries(summary.byType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`  ${type}: ${count}`);
    }
  });
  console.log('\nBy Table:');
  Object.entries(summary.byTable).forEach(([table, count]) => {
    if (count > 0) {
      console.log(`  ${table}: ${count}`);
    }
  });
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Reference map saved to: ${OUTPUT_FILE}\n`);
  
  return summary;
}

// Run scan
if (require.main === module) {
  scanDatabase()
    .then(() => {
      console.log('✨ Database scan complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { scanDatabase, categorizeUrl };

