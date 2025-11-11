/**
 * DateRangeFilter Component Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'

describe('DateRangeFilter Component', () => {
  const mockOnStartDateChange = jest.fn()
  const mockOnEndDateChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render date range inputs', () => {
    render(
      <DateRangeFilter
        startDate="2025-01-01"
        endDate="2025-01-31"
        onStartDateChange={mockOnStartDateChange}
        onEndDateChange={mockOnEndDateChange}
      />
    )

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')

    expect(startInput).toBeInTheDocument()
    expect(endInput).toBeInTheDocument()
    expect(startInput).toHaveValue('2025-01-01')
    expect(endInput).toHaveValue('2025-01-31')
  })

  it('should call onStartDateChange when start date changes', () => {
    render(
      <DateRangeFilter
        startDate=""
        endDate=""
        onStartDateChange={mockOnStartDateChange}
        onEndDateChange={mockOnEndDateChange}
      />
    )

    const startInput = screen.getByPlaceholderText('Start date')
    fireEvent.change(startInput, { target: { value: '2025-01-15' } })

    expect(mockOnStartDateChange).toHaveBeenCalledWith('2025-01-15')
  })

  it('should call onEndDateChange when end date changes', () => {
    render(
      <DateRangeFilter
        startDate=""
        endDate=""
        onStartDateChange={mockOnStartDateChange}
        onEndDateChange={mockOnEndDateChange}
      />
    )

    const endInput = screen.getByPlaceholderText('End date')
    fireEvent.change(endInput, { target: { value: '2025-01-31' } })

    expect(mockOnEndDateChange).toHaveBeenCalledWith('2025-01-31')
  })

  it('should display custom label', () => {
    render(
      <DateRangeFilter
        startDate=""
        endDate=""
        onStartDateChange={mockOnStartDateChange}
        onEndDateChange={mockOnEndDateChange}
        label="Custom Date Range"
      />
    )

    expect(screen.getByText('Custom Date Range')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <DateRangeFilter
        startDate=""
        endDate=""
        onStartDateChange={mockOnStartDateChange}
        onEndDateChange={mockOnEndDateChange}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})

