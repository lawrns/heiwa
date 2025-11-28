/**
 * Database Schema Audit Script
 * Phase 1.1: Verify all tables, columns, indexes, and RLS policies
 */

const { Client } = require('pg');

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

const REQUIRED_TABLES = [
  'bookings',
  'clients',
  'rooms',
  'surf_camps',
  'homepage_content',
  'navigation_items',
  'experiences',
  'pages',
  'room_assignments',
  'surf_camp_enrollments'
];

async function auditDatabaseSchema() {
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check table existence
    console.log('📋 Phase 1.1.1: Checking table existence...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const existingTables = tablesResult.rows.map(r => r.table_name);
    console.log(`Found ${existingTables.length} tables in database`);
    
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ All required tables exist\n');
    }

    // 2. Get schema for each required table
    console.log('📋 Phase 1.1.2: Analyzing table schemas...');
    for (const tableName of REQUIRED_TABLES) {
      if (!existingTables.includes(tableName)) {
        console.log(`\n⚠️  Skipping ${tableName} - table does not exist`);
        continue;
      }

      console.log(`\n📊 Table: ${tableName}`);
      console.log('─'.repeat(60));

      // Get columns
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log('Columns:');
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  - ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });

      // Get indexes
      const indexesResult = await client.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
        AND tablename = $1
        ORDER BY indexname;
      `, [tableName]);

      if (indexesResult.rows.length > 0) {
        console.log('\nIndexes:');
        indexesResult.rows.forEach(idx => {
          console.log(`  - ${idx.indexname}`);
        });
      }

      // Get RLS policies
      const policiesResult = await client.query(`
        SELECT 
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = $1
        ORDER BY policyname;
      `, [tableName]);

      if (policiesResult.rows.length > 0) {
        console.log('\nRLS Policies:');
        policiesResult.rows.forEach(policy => {
          console.log(`  - ${policy.policyname} (${policy.cmd})`);
        });
      } else {
        console.log('\n⚠️  No RLS policies found');
      }

      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
      console.log(`\nRow count: ${countResult.rows[0].count}`);
    }

    // 3. Check foreign keys
    console.log('\n\n📋 Phase 1.1.3: Checking foreign key constraints...');
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name IN (${REQUIRED_TABLES.map((_, i) => `$${i + 1}`).join(', ')})
      ORDER BY tc.table_name, kcu.column_name;
    `, REQUIRED_TABLES);

    if (fkResult.rows.length > 0) {
      console.log('Foreign Keys:');
      fkResult.rows.forEach(fk => {
        console.log(`  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('⚠️  No foreign key constraints found');
    }

    console.log('\n\n✅ Database schema audit complete!');

  } catch (error) {
    console.error('❌ Error auditing database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run audit
auditDatabaseSchema()
  .then(() => {
    console.log('\n✅ Audit completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });

