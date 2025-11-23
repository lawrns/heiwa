// Supabase connection diagnostics utility
// Helps identify connection issues in production

export interface SupabaseDiagnostics {
  url: string
  urlValid: boolean
  hasAnonKey: boolean
  hasServiceKey: boolean
  environment: 'development' | 'production' | 'unknown'
  canResolveDNS?: boolean
  error?: string
}

/**
 * Run diagnostics on Supabase configuration
 * This helps identify connection issues
 */
export async function diagnoseSupabaseConnection(): Promise<SupabaseDiagnostics> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
  const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 
                     process.env.NODE_ENV === 'development' ? 'development' : 'unknown'
  
  const urlValid = url.startsWith('https://') && url.includes('.supabase.co')
  
  let canResolveDNS: boolean | undefined
  let error: string | undefined
  
  // Try to resolve DNS (server-side only)
  if (typeof window === 'undefined') {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      
      // Use Node.js dns module if available
      if (typeof require !== 'undefined') {
        const dns = require('dns').promises
        try {
          await dns.resolve4(hostname)
          canResolveDNS = true
        } catch (dnsError: any) {
          canResolveDNS = false
          error = `DNS resolution failed: ${dnsError.message}`
        }
      }
    } catch (err: any) {
      error = `URL validation failed: ${err.message}`
    }
  }
  
  return {
    url,
    urlValid,
    hasAnonKey,
    hasServiceKey,
    environment,
    canResolveDNS,
    error
  }
}

/**
 * Log diagnostics to console (server-side only)
 */
export async function logSupabaseDiagnostics(): Promise<void> {
  if (typeof window !== 'undefined') return // Client-side only
  
  const diagnostics = await diagnoseSupabaseConnection()
  
  console.log('🔍 Supabase Connection Diagnostics:')
  console.log('  URL:', diagnostics.url)
  console.log('  URL Valid:', diagnostics.urlValid ? '✅' : '❌')
  console.log('  Has Anon Key:', diagnostics.hasAnonKey ? '✅' : '❌')
  console.log('  Has Service Key:', diagnostics.hasServiceKey ? '✅' : '❌')
  console.log('  Environment:', diagnostics.environment)
  
  if (diagnostics.canResolveDNS !== undefined) {
    console.log('  DNS Resolution:', diagnostics.canResolveDNS ? '✅' : '❌')
  }
  
  if (diagnostics.error) {
    console.error('  Error:', diagnostics.error)
  }
  
  if (!diagnostics.urlValid || !diagnostics.hasAnonKey) {
    console.error('⚠️  Supabase configuration issues detected!')
    console.error('   Please check your environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (server-side only)')
  }
  
  if (diagnostics.canResolveDNS === false) {
    console.error('⚠️  DNS resolution failed!')
    console.error('   This could mean:')
    console.error('   1. The Supabase project was deleted or paused')
    console.error('   2. Network connectivity issues')
    console.error('   3. DNS propagation delay')
    console.error('   Please verify the project exists at: https://supabase.com/dashboard')
  }
}

