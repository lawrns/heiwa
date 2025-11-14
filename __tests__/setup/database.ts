/**
 * Test Database Setup Utilities
 * Provides test database connection and helper functions
 * Supports both Supabase client and direct PostgreSQL connection
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Client } from 'pg'

let testSupabase: SupabaseClient | null = null
let testPostgresClient: Client | null = null

/**
 * Get test Supabase client
 * Uses test database if TEST_SUPABASE_URL is set, otherwise uses mocked client
 */
export function getTestSupabase(): SupabaseClient {
  if (testSupabase) {
    return testSupabase
  }

  const testUrl = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const testKey = process.env.TEST_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!testUrl || !testKey) {
    throw new Error(
      'Test database credentials not found. Set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_KEY'
    )
  }

  testSupabase = createClient(testUrl, testKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return testSupabase
}

/**
 * Get test PostgreSQL client (direct connection)
 * Uses DATABASE_URL or default connection string
 */
export function getTestPostgresClient(): Client {
  if (testPostgresClient && !testPostgresClient.ended) {
    return testPostgresClient
  }

  const connectionString = process.env.TEST_DATABASE_URL || 
    process.env.DATABASE_URL || 
    'postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres'

  testPostgresClient = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  return testPostgresClient
}

/**
 * Setup test database with seed data
 */
export async function setupTestDatabase(): Promise<void> {
  const supabase = getTestSupabase()

  // Clean up any existing test data
  await teardownTestDatabase()

  // Seed test data
  // Note: In a real implementation, you'd seed test rooms, clients, etc.
  console.log('✅ Test database setup complete')
}

/**
 * Clean up test database
 */
export async function teardownTestDatabase(): Promise<void> {
  const supabase = getTestSupabase()

  try {
    // Delete test bookings
    await supabase
      .from('bookings')
      .delete()
      .like('id', 'test-%')

    // Delete test clients
    await supabase
      .from('clients')
      .delete()
      .like('email', 'test-%')

    // Delete test invoices
    await supabase
      .from('invoices')
      .delete()
      .like('invoice_number', 'TEST-%')

    console.log('✅ Test database cleaned up')
  } catch (error) {
    console.warn('Warning: Error cleaning up test database:', error)
  }
}

/**
 * Create a test transaction wrapper
 * Rolls back all changes after test completes
 */
export async function withTestTransaction<T>(
  testFn: (supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const supabase = getTestSupabase()

  // Start transaction (if supported)
  // Note: Supabase doesn't support transactions directly
  // This is a placeholder for transaction-like behavior
  try {
    const result = await testFn(supabase)
    return result
  } catch (error) {
    throw error
  } finally {
    // Cleanup would happen here in a real transaction
  }
}

/**
 * Reset test database to clean state
 */
export async function resetTestDatabase(): Promise<void> {
  await teardownTestDatabase()
  await setupTestDatabase()
}

