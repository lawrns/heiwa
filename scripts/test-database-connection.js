#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Verifies that the database connection is working correctly
 */

const { Client } = require('pg')

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function testConnection() {
  console.log('🔍 Testing database connection...\n')
  
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    // Test connection
    console.log('📡 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully!\n')

    // Test query - get database version
    console.log('📊 Testing query execution...')
    const versionResult = await client.query('SELECT version()')
    console.log('✅ Query executed successfully')
    console.log(`   Database: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}\n`)

    // Test - get table count
    console.log('📋 Checking tables...')
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    const tableCount = parseInt(tablesResult.rows[0].count)
    console.log(`✅ Found ${tableCount} tables in public schema\n`)

    // List some key tables
    const keyTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name 
      LIMIT 10
    `)
    console.log('📑 Sample tables:')
    keyTablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })
    console.log('')

    // Test - check for critical tables
    console.log('🔍 Checking critical tables...')
    const criticalTables = ['bookings', 'clients', 'rooms', 'surf_camps', 'page_content']
    const existingTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `, [criticalTables])
    
    const existingTables = existingTablesResult.rows.map(r => r.table_name)
    const missingTables = criticalTables.filter(t => !existingTables.includes(t))
    
    if (missingTables.length === 0) {
      console.log('✅ All critical tables exist')
    } else {
      console.log('⚠️  Missing tables:')
      missingTables.forEach(table => console.log(`   - ${table}`))
    }
    console.log('')

    console.log('✅ Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection test failed!')
    console.error('Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check that DATABASE_URL environment variable is set')
    console.error('2. Verify database credentials are correct')
    console.error('3. Check network connectivity to Supabase')
    console.error('4. Verify SSL settings are correct')
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run test
testConnection()
  .then(() => {
    console.log('\n✨ All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error)
    process.exit(1)
  })

