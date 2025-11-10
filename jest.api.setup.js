/**
 * Setup file for API route tests
 */

// Mock Next.js request/response
global.NextRequest = class NextRequest {
  constructor(url, init = {}) {
    this.url = url
    this.method = init.method || 'GET'
    this.headers = new Headers(init.headers || {})
    this._body = init.body
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body)
    }
    return this._body
  }

  async formData() {
    return this._body
  }
}

global.NextResponse = class NextResponse {
  constructor(body, init = {}) {
    this._body = body
    this.status = init.status || 200
    this.headers = new Headers(init.headers || {})
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body)
    }
    return this._body
  }
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
