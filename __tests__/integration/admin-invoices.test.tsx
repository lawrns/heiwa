/**
 * Integration Tests for Admin Invoices Page
 */

import { render, screen, waitFor } from '@testing-library/react'
import InvoicesPage from '@/app/admin/invoices/page'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Admin Invoices Page Integration', () => {
  it('should render invoices page', async () => {
    render(<InvoicesPage />)

    await waitFor(() => {
      expect(screen.getByText(/Invoices/i)).toBeInTheDocument()
    })
  })

  it('should display invoice list', async () => {
    render(<InvoicesPage />)

    await waitFor(() => {
      expect(screen.getByText(/Create Invoice/i)).toBeInTheDocument()
    })
  })
})











