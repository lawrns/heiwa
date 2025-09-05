import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const databaseUrl = process.env.SUPABASE_DATABASE_URL!

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigrations() {
  console.log('🚀 Starting database migrations...')

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Read and execute initial schema migration
    console.log('📝 Creating initial schema...')
    const schemaSql = readFileSync(join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8')

    await client.query(schemaSql)
    console.log('✅ Initial schema created successfully')

    console.log('🎉 All migrations completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.end()
  }
}

// Run migrations
if (require.main === module) {
  runMigrations()
}
