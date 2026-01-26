#!/usr/bin/env ts-node

/**
 * Migration Runner Script
 * Runs SQL migration files using PostgreSQL connection
 * 
 * Usage:
 *   npm run migrate -- migrations/20250121_fix_admin_issues.sql
 *   or
 *   ts-node scripts/run-migration.ts migrations/20250121_fix_admin_issues.sql
 */

import { runMigrationFile } from '../lib/db/postgres'
import * as path from 'path'

async function main() {
  const migrationFile = process.argv[2]
  
  if (!migrationFile) {
    console.error('❌ Please provide a migration file path')
    console.log('Usage: npm run migrate -- migrations/your-migration.sql')
    process.exit(1)
  }

  try {
    console.log(`🔄 Running migration: ${migrationFile}`)
    await runMigrationFile(migrationFile)
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

main()

