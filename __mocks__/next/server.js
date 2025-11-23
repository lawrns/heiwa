// Manual mock for next/server
class MockRequest {
  constructor(url, init = {}) {
    this.url = typeof url === 'string' ? url : url.url || url.href
    this.method = init.method || 'GET'
    this.headers = new Headers(init.headers || {})
    this._body = init.body
    this._bodyUsed = false
  }

  async json() {
    if (this._bodyUsed) throw new Error('Body already used')
    this._bodyUsed = true
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body || {}
  }

  async formData() {
    if (this._bodyUsed) throw new Error('Body already used')
    this._bodyUsed = true
    return this._body
  }

  async text() {
    if (this._bodyUsed) throw new Error('Body already used')
    this._bodyUsed = true
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this._body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Headers(init.headers || {})
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
  }

  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
  }

  static json(body, init = {}) {
    return new MockResponse(JSON.stringify(body), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
  }
}

class MockNextRequest extends MockRequest {
  constructor(url, init = {}) {
    super(url, init)
    this.cookies = new Map()
  }
}

// Set globals
if (typeof global.Request === 'undefined') {
  global.Request = MockRequest
}
if (typeof global.Response === 'undefined') {
  global.Response = MockResponse
}

module.exports = {
  NextRequest: MockNextRequest,
  NextResponse: MockResponse,
}
