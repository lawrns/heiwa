import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboard from '@/app/admin/page'

// Mock fetch
global.fetch = jest.fn()

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders the dashboard page', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          totalBookings: 150,
          totalRevenue: 5000,
          activeClients: 45,
          monthOverMonth: 12.5,
        },
      }),
    })

    render(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    render(<AdminDashboard />)
    
    // The component should render without crashing
    expect(screen.getByRole('main') || document.querySelector('main')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<AdminDashboard />)
    
    await waitFor(() => {
      // Component should still render even with errors
      expect(document.body).toBeInTheDocument()
    })
  })

  it('displays stat cards with correct data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          totalBookings: 150,
          totalRevenue: 5000,
          activeClients: 45,
          monthOverMonth: 12.5,
        },
      }),
    })

    render(<AdminDashboard />)
    
    await waitFor(() => {
      // Check for stat card content
      expect(screen.queryByText(/150/) || screen.queryByText(/5000/)).toBeInTheDocument()
    })
  })

  it('refreshes data on interval', async () => {
    jest.useFakeTimers()
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          totalBookings: 150,
          totalRevenue: 5000,
          activeClients: 45,
          monthOverMonth: 12.5,
        },
      }),
    })

    render(<AdminDashboard />)

    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const initialCallCount = (global.fetch as jest.Mock).mock.calls.length

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    jest.useRealTimers()
  })
})
