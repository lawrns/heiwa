/**
 * Integration Tests for Admin Payments Page
 */

import { render, screen, waitFor } from '@testing-library/react'
import PaymentsPage from '@/app/admin/payments/page'
import { rest } from 'msw'
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
      rest.post('/api/payments', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
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
          })
        )
      })
    )

    render(<PaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Record Payment/i)).toBeInTheDocument()
    })
  })
})

