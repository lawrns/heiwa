/**
 * Setup file for API route tests
 */

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.ADMIN_PASSWORD = 'heiwa_admin_2024'

// Mock requireAdminAuth to bypass auth in unit tests
// (NextRequest doesn't parse cookie headers in Jest)
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(() => null), // null = no auth error
}))
