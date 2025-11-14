/**
 * PostgreSQL Database Connection Utility
 * Direct PostgreSQL connection for migrations and admin operations
 */

import { Client } from 'pg'

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres'

/**
 * Get PostgreSQL client
 */
export function getPostgresClient(): Client {
  return new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase
    },
  })
}

/**
 * Execute a SQL query
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const client = getPostgresClient()
  
  try {
    await client.connect()
    const result = await client.query(query, params)
    return result.rows as T[]
  } finally {
    await client.end()
  }
}

/**
 * Execute a SQL migration file
 */
export async function executeMigration(sql: string): Promise<void> {
  const client = getPostgresClient()
  
  try {
    await client.connect()
    await client.query(sql)
    console.log('✅ Migration executed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

/**
 * Check if a table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const result = await executeQuery<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )`,
    [tableName]
  )
  
  return result[0]?.exists || false
}

/**
 * Get all tables in the database
 */
export async function getAllTables(): Promise<string[]> {
  const result = await executeQuery<{ tablename: string }>(
    `SELECT tablename 
     FROM pg_tables 
     WHERE schemaname = 'public' 
     ORDER BY tablename`
  )
  
  return result.map(row => row.tablename)
}

/**
 * Run a migration file from the filesystem
 */
export async function runMigrationFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const fullPath = path.resolve(process.cwd(), filePath)
  const sql = await fs.readFile(fullPath, 'utf-8')
  
  await executeMigration(sql)
}

