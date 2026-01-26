/**
 * API Mocking Utilities
 * Provides consistent patterns for mocking fetch and API responses
 */

// ============================================================================
// Types
// ============================================================================

export interface MockApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MockFetchOptions {
  status?: number;
  headers?: Record<string, string>;
  delay?: number;
}

// ============================================================================
// Fetch Mock Setup
// ============================================================================

type FetchMock = jest.Mock<Promise<Response>>;

let originalFetch: typeof global.fetch;
let mockFetchImpl: FetchMock | null = null;

/**
 * Setup fetch mocking for tests
 * Call this in beforeEach or beforeAll
 */
export function setupFetchMock(): FetchMock {
  originalFetch = global.fetch;
  mockFetchImpl = jest.fn();
  global.fetch = mockFetchImpl;
  return mockFetchImpl;
}

/**
 * Restore original fetch
 * Call this in afterEach or afterAll
 */
export function restoreFetch(): void {
  if (originalFetch) {
    global.fetch = originalFetch;
  }
  mockFetchImpl = null;
}

/**
 * Get the current fetch mock
 */
export function getFetchMock(): FetchMock | null {
  return mockFetchImpl;
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Create a mock Response object
 */
export function createMockResponse<T>(
  data: T,
  options: MockFetchOptions = {}
): Response {
  const { status = 200, headers = {} } = options;
  
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: getStatusText(status),
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
  } as Response;
}

/**
 * Get HTTP status text for a status code
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}

// ============================================================================
// Mock Response Helpers
// ============================================================================

/**
 * Mock a successful API response
 */
export function mockApiResponse<T>(
  endpoint: string,
  response: T,
  options: MockFetchOptions = {}
): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized. Call setupFetchMock() first.');
  }
  
  const mockResponse = createMockResponse(
    { success: true, data: response },
    options
  );
  
  mockFetchImpl.mockImplementation(async (url: string) => {
    if (url.includes(endpoint)) {
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
      return mockResponse;
    }
    return createMockResponse({ success: false, error: 'Not found' }, { status: 404 });
  });
}

/**
 * Mock an API error response
 */
export function mockApiError(
  endpoint: string,
  status: number,
  message: string
): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized. Call setupFetchMock() first.');
  }
  
  const mockResponse = createMockResponse(
    { success: false, error: message, message },
    { status }
  );
  
  mockFetchImpl.mockImplementation(async (url: string) => {
    if (url.includes(endpoint)) {
      return mockResponse;
    }
    return createMockResponse({ success: false, error: 'Not found' }, { status: 404 });
  });
}

/**
 * Mock a network failure
 */
export function mockNetworkError(endpoint?: string): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized. Call setupFetchMock() first.');
  }
  
  mockFetchImpl.mockImplementation(async (url: string) => {
    if (!endpoint || url.includes(endpoint)) {
      throw new Error('Network error');
    }
    return createMockResponse({ success: false, error: 'Not found' }, { status: 404 });
  });
}

/**
 * Mock a timeout
 */
export function mockTimeout(endpoint: string, timeoutMs: number = 30000): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized. Call setupFetchMock() first.');
  }
  
  mockFetchImpl.mockImplementation(async (url: string) => {
    if (url.includes(endpoint)) {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
      });
    }
    return createMockResponse({ success: false, error: 'Not found' }, { status: 404 });
  });
}

// ============================================================================
// Response Templates
// ============================================================================

/**
 * Common API response templates
 */
export const responseTemplates = {
  success: <T>(data: T): MockApiResponse<T> => ({
    success: true,
    data,
  }),
  
  error: (message: string): MockApiResponse => ({
    success: false,
    error: message,
    message,
  }),
  
  validationError: (errors: string[]): MockApiResponse => ({
    success: false,
    error: 'Validation failed',
    message: errors.join(', '),
  }),
  
  unauthorized: (): MockApiResponse => ({
    success: false,
    error: 'Unauthorized',
    message: 'Authentication required',
  }),
  
  notFound: (resource: string): MockApiResponse => ({
    success: false,
    error: 'Not found',
    message: `${resource} not found`,
  }),
  
  rateLimited: (): MockApiResponse => ({
    success: false,
    error: 'Rate limited',
    message: 'Too many requests. Please try again later.',
  }),
  
  serverError: (): MockApiResponse => ({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  }),
};

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that fetch was called with specific endpoint
 */
export function expectFetchCalledWith(endpoint: string): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized');
  }
  
  const calls = mockFetchImpl.mock.calls;
  const matchingCall = calls.find(call => 
    typeof call[0] === 'string' && call[0].includes(endpoint)
  );
  
  expect(matchingCall).toBeDefined();
}

/**
 * Assert that fetch was called with specific method
 */
export function expectFetchMethod(method: string): void {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized');
  }
  
  const calls = mockFetchImpl.mock.calls;
  const matchingCall = calls.find(call => 
    call[1]?.method?.toUpperCase() === method.toUpperCase()
  );
  
  expect(matchingCall).toBeDefined();
}

/**
 * Get the request body from the last fetch call
 */
export function getLastRequestBody<T = unknown>(): T | null {
  if (!mockFetchImpl) {
    throw new Error('Fetch mock not initialized');
  }
  
  const calls = mockFetchImpl.mock.calls;
  if (calls.length === 0) return null;
  
  const lastCall = calls[calls.length - 1];
  const body = lastCall[1]?.body;
  
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      return null;
    }
  }
  
  return null;
}
