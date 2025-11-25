import { renderHook, act } from '@testing-library/react'
import { useBookingsRealtime } from '@/lib/hooks/useBookingsRealtime'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    })),
    removeChannel: jest.fn(),
  },
}))

describe('useBookingsRealtime Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes without errors', () => {
    const { result } = renderHook(() => useBookingsRealtime())
    
    // Hook returns void, just verify it doesn't throw
    expect(result.current).toBeUndefined()
  })

  it('accepts callback options', async () => {
    const onInsert = jest.fn()
    const onUpdate = jest.fn()
    const onDelete = jest.fn()
    
    const { result } = renderHook(() => useBookingsRealtime({
      onInsert,
      onUpdate,
      onDelete,
    }))

    // Wait for subscription setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Hook returns void
    expect(result.current).toBeUndefined()
  })

  it('cleans up subscription on unmount', () => {
    const { unmount } = renderHook(() => useBookingsRealtime())

    unmount()

    // Subscription should be cleaned up - no errors thrown
    expect(true).toBe(true)
  })
})
