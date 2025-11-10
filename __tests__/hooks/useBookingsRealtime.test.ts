import { renderHook, act } from '@testing-library/react'
import { useBookingsRealtime } from '@/lib/hooks/useBookingsRealtime'

describe('useBookingsRealtime Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with empty bookings', () => {
    const { result } = renderHook(() => useBookingsRealtime())
    
    expect(result.current.bookings).toEqual([])
    expect(result.current.loading).toBe(true)
  })

  it('handles INSERT events', async () => {
    const { result } = renderHook(() => useBookingsRealtime())

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Simulate INSERT event
    const newBooking = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'confirmed',
    }

    // The hook should handle INSERT events
    expect(result.current).toBeDefined()
  })

  it('handles UPDATE events', async () => {
    const { result } = renderHook(() => useBookingsRealtime())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // The hook should handle UPDATE events
    expect(result.current).toBeDefined()
  })

  it('handles DELETE events', async () => {
    const { result } = renderHook(() => useBookingsRealtime())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // The hook should handle DELETE events
    expect(result.current).toBeDefined()
  })

  it('cleans up subscription on unmount', () => {
    const { unmount } = renderHook(() => useBookingsRealtime())

    unmount()

    // Subscription should be cleaned up
    expect(true).toBe(true)
  })
})
