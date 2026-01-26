#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates all data from old database to new database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const OLD_DB_CONFIG = {
  host: 'db.zejrhceuuujzgyukdwnb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Hennie@@12Hennie@@12',
  ssl: { rejectUnauthorized: false }
};

const NEW_DB_CONFIG = {
  host: 'db.pguipwhrxdzzrndbluxb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'cqv_kmb-WEP.vez6xze',
  ssl: { rejectUnauthorized: false }
};

// Tables to skip
const SKIP_TABLES = ['schema_migrations'];

// Order matters for tables with foreign keys - migrate in dependency order
const TABLE_ORDER = [
  'blog_categories',
  'blog_tags',
  'blog_authors',
  'blog_posts',
  'blog_post_translations',
  'blog_post_tags',
  'navigation_items',
  'rooms',
  'experiences',
  'surf_camps',
  'testimonials',
  'faq_items',
  'pages',
  'pages_meta',
  'page_content',
  'homepage_sections',
  'homepage_content',
  'media_library',
  'cta_buttons',
  'activity_log'
];

async function getTables(client) {
  const result = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);
  return result.rows.map(row => row.tablename);
}

async function tableExists(client, tableName) {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  return result.rows[0].exists;
}

async function getRowCount(client, tableName) {
  const result = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
  return parseInt(result.rows[0].count);
}

async function migrateTable(oldClient, newClient, tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}`);
  
  // Check if table exists in new database
  const exists = await tableExists(newClient, tableName);
  if (!exists) {
    console.log(`  ⚠️  Table ${tableName} doesn't exist in new database, skipping...`);
    return { migrated: false, reason: 'table_not_exists' };
  }
  
  // Get row count from old database
  const oldCount = await getRowCount(oldClient, tableName);
  if (oldCount === 0) {
    console.log(`  ℹ️  No data to migrate (0 rows)`);
    return { migrated: true, rows: 0 };
  }
  
  // Get row count from new database
  const newCount = await getRowCount(newClient, tableName);
  
  console.log(`  📊 Old DB: ${oldCount} rows, New DB: ${newCount} rows`);
  
  // Export data from old database
  console.log(`  📤 Exporting data from old database...`);
  const result = await oldClient.query(`SELECT * FROM ${tableName};`);
  
  if (result.rows.length === 0) {
    console.log(`  ℹ️  No data to migrate`);
    return { migrated: true, rows: 0 };
  }
  
  // Get column names
  const columns = Object.keys(result.rows[0]);
  const columnList = columns.join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  
  // Disable triggers temporarily
  try {
    await newClient.query(`ALTER TABLE ${tableName} DISABLE TRIGGER ALL;`);
  } catch (err) {
    console.log(`  ⚠️  Could not disable triggers: ${err.message}`);
  }
  
  // Clear existing data if needed (optional - comment out if you want to merge)
  if (newCount > 0) {
    console.log(`  🗑️  Clearing existing data from new database...`);
    await newClient.query(`TRUNCATE TABLE ${tableName} CASCADE;`);
  }
  
  // Insert data in batches
  console.log(`  📥 Importing ${result.rows.length} rows into new database...`);
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < result.rows.length; i += batchSize) {
    const batch = result.rows.slice(i, i + batchSize);
    
    for (const row of batch) {
      const values = columns.map(col => row[col]);
      try {
        await newClient.query(
          `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`,
          values
        );
        inserted++;
      } catch (err) {
        console.log(`  ⚠️  Error inserting row: ${err.message}`);
        // Continue with next row
      }
    }
    
    if (i % (batchSize * 10) === 0) {
      process.stdout.write(`  Progress: ${Math.min(i + batchSize, result.rows.length)}/${result.rows.length}\r`);
    }
  }
  
  // Re-enable triggers
  try {
    await newClient.query(`ALTER TABLE ${tableName} ENABLE TRIGGER ALL;`);
  } catch (err) {
    console.log(`  ⚠️  Could not re-enable triggers: ${err.message}`);
  }
  
  const finalCount = await getRowCount(newClient, tableName);
  console.log(`  ✅ Migrated ${inserted} rows (${finalCount} total in new DB)`);
  
  return { migrated: true, rows: inserted };
}

async function main() {
  console.log('🔄 Starting database migration...\n');
  
  const oldClient = new Client(OLD_DB_CONFIG);
  const newClient = new Client(NEW_DB_CONFIG);
  
  try {
    // Connect to both databases
    console.log('📡 Connecting to databases...');
    await oldClient.connect();
    console.log('  ✅ Connected to old database');
    await newClient.connect();
    console.log('  ✅ Connected to new database');
    
    // Get tables from old database
    console.log('\n📋 Getting list of tables...');
    const allTables = await getTables(oldClient);
    console.log(`  Found ${allTables.length} tables`);
    
    // Determine migration order
    const tablesToMigrate = [];
    for (const table of TABLE_ORDER) {
      if (allTables.includes(table) && !SKIP_TABLES.includes(table)) {
        tablesToMigrate.push(table);
      }
    }
    
    // Add any remaining tables not in TABLE_ORDER
    for (const table of allTables) {
      if (!tablesToMigrate.includes(table) && !SKIP_TABLES.includes(table)) {
        tablesToMigrate.push(table);
      }
    }
    
    console.log(`\n📊 Tables to migrate: ${tablesToMigrate.length}`);
    console.log(`  ${tablesToMigrate.join(', ')}\n`);
    
    // Migrate each table
    const results = [];
    for (const table of tablesToMigrate) {
      try {
        const result = await migrateTable(oldClient, newClient, table);
        results.push({ table, ...result });
      } catch (err) {
        console.error(`  ❌ Error migrating ${table}: ${err.message}`);
        results.push({ table, migrated: false, error: err.message });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.migrated).length;
    const failed = results.filter(r => !r.migrated).length;
    const totalRows = results.reduce((sum, r) => sum + (r.rows || 0), 0);
    
    console.log(`✅ Successfully migrated: ${successful} tables`);
    console.log(`❌ Failed: ${failed} tables`);
    console.log(`📊 Total rows migrated: ${totalRows}`);
    
    if (failed > 0) {
      console.log('\n⚠️  Failed tables:');
      results.filter(r => !r.migrated).forEach(r => {
        console.log(`  - ${r.table}: ${r.reason || r.error}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await oldClient.end();
    await newClient.end();
    console.log('\n✅ Migration complete!');
  }
}

main().catch(console.error);

