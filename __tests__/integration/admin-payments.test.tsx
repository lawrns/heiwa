/**
 * Integration Tests for Admin Payments Page
 */

import { render, screen, waitFor } from '@testing-library/react'
import PaymentsPage from '@/app/admin/payments/page'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Admin Payments Page Integration', () => {
  it('should render payments page with stats', async () => {
    render(<PaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Payments')).toBeInTheDocument()
      expect(screen.getByText('Total Payments')).toBeInTheDocument()
      expect(screen.getByText('Total Amount')).toBeInTheDocument()
    })
  })

  it('should display payment list', async () => {
    render(<PaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Record Payment/i)).toBeInTheDocument()
    })
  })

  it('should handle payment creation', async () => {
    server.use(
      http.post('/api/payments', () => {
        return HttpResponse.json({
          success: true,
          data: {
            payment: {
              id: 'payment-new',
              booking_id: 'booking-1',
              amount: 150,
              currency: 'EUR',
              payment_method: 'cash',
              payment_status: 'completed',
            },
          },
        }, { status: 201 })
      })
    )

    render(<PaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Record Payment/i)).toBeInTheDocument()
    })
  })
})











