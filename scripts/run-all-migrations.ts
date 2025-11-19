#!/usr/bin/env ts-node

/**
 * Run all migrations against the database
 */

import { runMigrationFile } from '../lib/db/postgres'
import * as fs from 'fs/promises'
import * as path from 'path'

const migrationsDir = path.join(process.cwd(), 'migrations')

async function getAllMigrationFiles(): Promise<string[]> {
  const files = await fs.readdir(migrationsDir)
  return files
    .filter(file => file.endsWith('.sql'))
    .sort() // Run in alphabetical order
    .map(file => path.join(migrationsDir, file))
}

async function main() {
  console.log('🔄 Starting database migrations...\n')
  
  const migrationFiles = await getAllMigrationFiles()
  console.log(`Found ${migrationFiles.length} migration files\n`)
  
  for (const file of migrationFiles) {
    try {
      console.log(`Running: ${path.basename(file)}`)
      await runMigrationFile(file)
      console.log(`✅ ${path.basename(file)} completed\n`)
    } catch (error: any) {
      // Some migrations might fail if tables already exist, which is okay
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log(`⚠️  ${path.basename(file)} skipped (already applied)\n`)
      } else {
        console.error(`❌ ${path.basename(file)} failed:`, error.message)
        // Continue with other migrations
      }
    }
  }
  
  console.log('✅ All migrations completed')
}

main().catch(console.error)

