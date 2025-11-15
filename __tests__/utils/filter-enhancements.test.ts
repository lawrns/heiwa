/**
 * Enhanced Filter Logic Tests
 * Tests for date range and amount range filtering
 */

describe('Enhanced Filter Logic', () => {
  const mockBookings = [
    {
      id: 'booking-1',
      guest_name: 'John Doe',
      check_in: '2025-01-15',
      check_out: '2025-01-20',
      total_price: 500,
      status: 'confirmed',
      payment_status: 'paid',
    },
    {
      id: 'booking-2',
      guest_name: 'Jane Smith',
      check_in: '2025-02-01',
      check_out: '2025-02-05',
      total_price: 300,
      status: 'pending',
      payment_status: 'pending',
    },
    {
      id: 'booking-3',
      guest_name: 'Bob Johnson',
      check_in: '2025-01-25',
      check_out: '2025-01-30',
      total_price: 800,
      status: 'confirmed',
      payment_status: 'paid',
    },
  ]

  const mockInvoices = [
    {
      id: 'invoice-1',
      invoice_number: 'HW-INV-2025-0001',
      amount: 500,
      due_date: '2025-02-15',
      status: 'sent',
    },
    {
      id: 'invoice-2',
      invoice_number: 'HW-INV-2025-0002',
      amount: 300,
      due_date: '2025-02-20',
      status: 'paid',
    },
    {
      id: 'invoice-3',
      invoice_number: 'HW-INV-2025-0003',
      amount: 1000,
      due_date: '2025-03-01',
      status: 'draft',
    },
  ]

  const mockPayments = [
    {
      id: 'payment-1',
      amount: 500,
      payment_date: '2025-01-15',
      payment_status: 'completed',
    },
    {
      id: 'payment-2',
      amount: 300,
      payment_date: '2025-02-01',
      payment_status: 'completed',
    },
    {
      id: 'payment-3',
      amount: 800,
      payment_date: '2025-01-25',
      payment_status: 'pending',
    },
  ]

  describe('Date Range Filtering', () => {
    it('should filter bookings by check-in date range', () => {
      const dateRange = { startDate: '2025-01-20', endDate: '2025-02-05' }
      
      const filtered = mockBookings.filter(booking => {
        if (dateRange.startDate || dateRange.endDate) {
          const checkInDate = new Date(booking.check_in)
          if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(b => b.id)).toEqual(['booking-2', 'booking-3'])
    })

    it('should filter invoices by due date range', () => {
      const dateRange = { startDate: '2025-02-15', endDate: '2025-02-25' }
      
      const filtered = mockInvoices.filter(invoice => {
        if (invoice.due_date) {
          const dueDate = new Date(invoice.due_date)
          if (dateRange.startDate && dueDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && dueDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(i => i.id)).toEqual(['invoice-1', 'invoice-2'])
    })

    it('should filter payments by payment date range', () => {
      const dateRange = { startDate: '2025-01-20', endDate: '2025-02-05' }
      
      const filtered = mockPayments.filter(payment => {
        if (payment.payment_date) {
          const paymentDate = new Date(payment.payment_date)
          if (dateRange.startDate && paymentDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && paymentDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('payment-2')
    })

    it('should handle empty date range (no filtering)', () => {
      const dateRange = { startDate: '', endDate: '' }
      
      const filtered = mockBookings.filter(booking => {
        if (dateRange.startDate || dateRange.endDate) {
          const checkInDate = new Date(booking.check_in)
          if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(3)
    })

    it('should handle only start date', () => {
      const dateRange = { startDate: '2025-01-20', endDate: '' }
      
      const filtered = mockBookings.filter(booking => {
        if (dateRange.startDate || dateRange.endDate) {
          const checkInDate = new Date(booking.check_in)
          if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(b => b.id)).toEqual(['booking-2', 'booking-3'])
    })

    it('should handle only end date', () => {
      const dateRange = { startDate: '', endDate: '2025-01-20' }
      
      const filtered = mockBookings.filter(booking => {
        if (dateRange.startDate || dateRange.endDate) {
          const checkInDate = new Date(booking.check_in)
          if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('booking-1')
    })
  })

  describe('Amount Range Filtering', () => {
    it('should filter invoices by amount range', () => {
      const amountRange = { minAmount: '400', maxAmount: '600' }
      
      const filtered = mockInvoices.filter(invoice => {
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = invoice.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('invoice-1')
    })

    it('should filter payments by amount range', () => {
      const amountRange = { minAmount: '400', maxAmount: '600' }
      
      const filtered = mockPayments.filter(payment => {
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = payment.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('payment-1')
    })

    it('should handle empty amount range (no filtering)', () => {
      const amountRange = { minAmount: '', maxAmount: '' }
      
      const filtered = mockInvoices.filter(invoice => {
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = invoice.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(3)
    })

    it('should handle only min amount', () => {
      const amountRange = { minAmount: '500', maxAmount: '' }
      
      const filtered = mockInvoices.filter(invoice => {
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = invoice.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(i => i.id)).toEqual(['invoice-1', 'invoice-3'])
    })

    it('should handle only max amount', () => {
      const amountRange = { minAmount: '', maxAmount: '500' }
      
      const filtered = mockInvoices.filter(invoice => {
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = invoice.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        return true
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(i => i.id)).toEqual(['invoice-1', 'invoice-2'])
    })
  })

  describe('Combined Filters', () => {
    it('should combine date range and amount range filters', () => {
      const dateRange = { startDate: '2025-02-15', endDate: '2025-02-25' }
      const amountRange = { minAmount: '400', maxAmount: '600' }
      
      const filtered = mockInvoices.filter(invoice => {
        // Date filter
        if (invoice.due_date) {
          const dueDate = new Date(invoice.due_date)
          if (dateRange.startDate && dueDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && dueDate > new Date(dateRange.endDate)) return false
        }
        
        // Amount filter
        if (amountRange.minAmount || amountRange.maxAmount) {
          const amount = invoice.amount
          if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
          if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
        }
        
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('invoice-1')
    })

    it('should combine status filter with date range', () => {
      const dateRange = { startDate: '2025-01-20', endDate: '2025-02-05' }
      const statusFilter = 'confirmed'
      
      const filtered = mockBookings.filter(booking => {
        // Status filter
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false
        
        // Date filter
        if (dateRange.startDate || dateRange.endDate) {
          const checkInDate = new Date(booking.check_in)
          if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
          if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
        }
        
        return true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('booking-3')
    })
  })
})



