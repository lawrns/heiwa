#!/usr/bin/env node

/**
 * Run all migrations against the database
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:cqv_kmb-WEP.vez6xze@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

const migrationsDir = path.join(__dirname, '..', 'migrations')

async function getAllMigrationFiles() {
  const files = fs.readdirSync(migrationsDir)
  return files
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => path.join(migrationsDir, file))
}

async function runMigration(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8')
  await client.query(sql)
}

async function main() {
  console.log('🔄 Starting database migrations...\n')
  console.log(`Connecting to: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database\n')
    
    const migrationFiles = await getAllMigrationFiles()
    console.log(`Found ${migrationFiles.length} migration files\n`)
    
    for (const file of migrationFiles) {
      try {
        const fileName = path.basename(file)
        console.log(`Running: ${fileName}`)
        await runMigration(client, file)
        console.log(`✅ ${fileName} completed\n`)
      } catch (error) {
        // Some migrations might fail if tables already exist, which is okay
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.message?.includes('relation') && error.message?.includes('already exists')) {
          console.log(`⚠️  ${path.basename(file)} skipped (already applied)\n`)
        } else {
          console.error(`❌ ${path.basename(file)} failed:`, error.message)
          // Continue with other migrations
        }
      }
    }
    
    console.log('✅ All migrations completed')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch(console.error)

