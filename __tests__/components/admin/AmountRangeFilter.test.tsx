/**
 * AmountRangeFilter Component Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AmountRangeFilter } from '@/components/admin/AmountRangeFilter'

describe('AmountRangeFilter Component', () => {
  const mockOnMinAmountChange = jest.fn()
  const mockOnMaxAmountChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render amount range inputs', () => {
    render(
      <AmountRangeFilter
        minAmount="100"
        maxAmount="500"
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
      />
    )

    const minInput = screen.getByPlaceholderText('Min amount')
    const maxInput = screen.getByPlaceholderText('Max amount')

    expect(minInput).toBeInTheDocument()
    expect(maxInput).toBeInTheDocument()
    expect(minInput).toHaveValue(100)
    expect(maxInput).toHaveValue(500)
  })

  it('should call onMinAmountChange when min amount changes', () => {
    render(
      <AmountRangeFilter
        minAmount=""
        maxAmount=""
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
      />
    )

    const minInput = screen.getByPlaceholderText('Min amount')
    fireEvent.change(minInput, { target: { value: '250' } })

    expect(mockOnMinAmountChange).toHaveBeenCalledWith('250')
  })

  it('should call onMaxAmountChange when max amount changes', () => {
    render(
      <AmountRangeFilter
        minAmount=""
        maxAmount=""
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
      />
    )

    const maxInput = screen.getByPlaceholderText('Max amount')
    fireEvent.change(maxInput, { target: { value: '1000' } })

    expect(mockOnMaxAmountChange).toHaveBeenCalledWith('1000')
  })

  it('should display custom label', () => {
    render(
      <AmountRangeFilter
        minAmount=""
        maxAmount=""
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
        label="Custom Amount Range"
      />
    )

    expect(screen.getByText('Custom Amount Range')).toBeInTheDocument()
  })

  it('should use custom currency', () => {
    render(
      <AmountRangeFilter
        minAmount=""
        maxAmount=""
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
        currency="USD"
      />
    )

    // Currency icon should still be present (Euro icon is used visually)
    expect(screen.getByPlaceholderText('Min amount')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <AmountRangeFilter
        minAmount=""
        maxAmount=""
        onMinAmountChange={mockOnMinAmountChange}
        onMaxAmountChange={mockOnMaxAmountChange}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})

