import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConfigProvider } from '@/components/BookingWidget/types/config'
import { BookingProvider } from '@/lib/booking-context'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BookingProvider>
      {children}
    </BookingProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers for common assertions
export const assertButtonIsEnabled = (button: HTMLElement) => {
  expect(button).not.toBeDisabled()
  expect(button).toHaveAttribute('type', 'button')
}

export const assertButtonIsDisabled = (button: HTMLElement) => {
  expect(button).toBeDisabled()
}

export const assertLinkHasCorrectHref = (link: HTMLElement, href: string) => {
  expect(link).toHaveAttribute('href', href)
}

export const assertFormIsValid = (form: HTMLElement) => {
  expect(form).toHaveAttribute('novalidate')
}

export const assertInputHasCorrectType = (input: HTMLElement, type: string) => {
  expect(input).toHaveAttribute('type', type)
}

// Helper functions for common test scenarios
export const waitForLoadingToFinish = async (container: HTMLElement) => {
  const loadingElements = container.querySelectorAll('[data-testid="loading"]')
  if (loadingElements.length > 0) {
    // Wait for loading elements to disappear
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

export const fillForm = async (form: HTMLElement, data: Record<string, string>) => {
  for (const [name, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}

export const submitForm = async (form: HTMLElement) => {
  const submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement
  if (submitButton) {
    submitButton.click()
  }
}

// Mock user interactions
export const mockUserClick = (element: HTMLElement) => {
  element.click()
}

export const mockUserType = (input: HTMLElement, text: string) => {
  input.focus()
  ;(input as HTMLInputElement).value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

// Accessibility helpers
export const assertAccessibleHeading = (heading: HTMLElement, level: number, text: string) => {
  expect(heading).toHaveAttribute('role', 'heading')
  expect(heading).toHaveAttribute('aria-level', level.toString())
  expect(heading).toHaveTextContent(text)
}

export const assertAccessibleNavigation = (nav: HTMLElement) => {
  expect(nav).toHaveAttribute('role', 'navigation')
  expect(nav).toHaveAttribute('aria-label')
}

// Test data helpers
export const createMockProps = (overrides: Record<string, any> = {}) => ({
  className: 'test-class',
  'data-testid': 'test-component',
  ...overrides
})

// Component testing helpers
export const testComponentRenders = (Component: React.ComponentType<any>, props: any = {}) => {
  const { getByTestId } = customRender(<Component {...props} />)
  expect(getByTestId('test-component')).toBeInTheDocument()
}

export const testComponentWithChildren = (Component: React.ComponentType<any>) => {
  const { getByText } = customRender(
    <Component>
      <span>Test child content</span>
    </Component>
  )
  expect(getByText('Test child content')).toBeInTheDocument()
}

// Async testing helpers
export const testAsyncComponent = async (Component: React.ComponentType<any>) => {
  const { findByText } = customRender(<Component />)
  const element = await findByText(/content/i)
  expect(element).toBeInTheDocument()
}

// Error boundary testing
export const testErrorBoundary = (Component: React.ComponentType<any>) => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  customRender(<Component />)
  expect(consoleSpy).toHaveBeenCalled()
  consoleSpy.mockRestore()
}

// Performance testing helpers
export const measureRenderTime = (Component: React.ComponentType<any>, props: any = {}) => {
  const start = performance.now()
  customRender(<Component {...props} />)
  const end = performance.now()
  return end - start
}

// Responsive testing helpers
export const testResponsiveDesign = (Component: React.ComponentType<any>, breakpoints: number[]) => {
  breakpoints.forEach(width => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    
    const { container } = customRender(<Component />)
    expect(container).toBeInTheDocument()
  })
}

// Form validation testing helpers
export const testFieldValidation = async (
  fieldName: string,
  invalidValue: string,
  expectedError: string
) => {
  const { getByLabelText, getByText } = customRender(
    <form>
      <label>{fieldName}</label>
      <input name={fieldName} type="text" />
      <button type="submit">Submit</button>
    </form>
  )

  const input = getByLabelText(fieldName)
  const button = getByText('Submit')

  mockUserType(input, invalidValue)
  mockUserClick(button)

  await new Promise(resolve => setTimeout(resolve, 100))
  
  expect(getByText(expectedError)).toBeInTheDocument()
}

// API testing helpers
export const mockApiResponse = (url: string, response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(response),
    } as Response)
  )
}

export const testApiCall = async (url: string, method = 'GET') => {
  const response = await fetch(url, { method })
  expect(response).toBeDefined()
  return response
}

// Local storage testing helpers
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Session storage testing helpers
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Router testing helpers
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

export const mockPathname = (pathname: string) => {
  jest.mocked(require('next/navigation')).usePathname.mockReturnValue(pathname)
}

export const mockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params)
  jest.mocked(require('next/navigation')).useSearchParams.mockReturnValue(searchParams)
}
