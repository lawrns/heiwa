/**
 * BulkActions Component Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BulkActions } from '@/components/admin/BulkActions'

describe('BulkActions Component', () => {
  const mockActions = [
    {
      label: 'Mark Confirmed',
      onClick: jest.fn(),
    },
    {
      label: 'Delete',
      onClick: jest.fn(),
      variant: 'destructive' as const,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when no items are selected', () => {
    const { container } = render(
      <BulkActions
        selectedCount={0}
        totalCount={100}
        onSelectAll={jest.fn()}
        onDeselectAll={jest.fn()}
        actions={mockActions}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render when items are selected', () => {
    render(
      <BulkActions
        selectedCount={5}
        totalCount={100}
        onSelectAll={jest.fn()}
        onDeselectAll={jest.fn()}
        actions={mockActions}
      />
    )

    expect(screen.getByText('5 of 100 selected')).toBeInTheDocument()
    expect(screen.getByText('Mark Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should call onSelectAll when "Select all" is clicked', () => {
    const onSelectAll = jest.fn()
    render(
      <BulkActions
        selectedCount={5}
        totalCount={100}
        onSelectAll={onSelectAll}
        onDeselectAll={jest.fn()}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Select all'))
    expect(onSelectAll).toHaveBeenCalledTimes(1)
  })

  it('should call onDeselectAll when "Clear selection" is clicked', () => {
    const onDeselectAll = jest.fn()
    render(
      <BulkActions
        selectedCount={5}
        totalCount={100}
        onSelectAll={jest.fn()}
        onDeselectAll={onDeselectAll}
        actions={mockActions}
      />
    )

    fireEvent.click(screen.getByText('Clear selection'))
    expect(onDeselectAll).toHaveBeenCalledTimes(1)
  })

  it('should call action onClick when action button is clicked', () => {
    const markConfirmed = jest.fn()
    render(
      <BulkActions
        selectedCount={5}
        totalCount={100}
        onSelectAll={jest.fn()}
        onDeselectAll={jest.fn()}
        actions={[
          {
            label: 'Mark Confirmed',
            onClick: markConfirmed,
          },
        ]}
      />
    )

    fireEvent.click(screen.getByText('Mark Confirmed'))
    expect(markConfirmed).toHaveBeenCalledTimes(1)
  })

  it('should disable action buttons when disabled prop is true', () => {
    render(
      <BulkActions
        selectedCount={5}
        totalCount={100}
        onSelectAll={jest.fn()}
        onDeselectAll={jest.fn()}
        actions={[
          {
            label: 'Disabled Action',
            onClick: jest.fn(),
            disabled: true,
          },
        ]}
      />
    )

    const button = screen.getByText('Disabled Action')
    expect(button).toBeDisabled()
  })

  it('should display correct selection count', () => {
    render(
      <BulkActions
        selectedCount={42}
        totalCount={150}
        onSelectAll={jest.fn()}
        onDeselectAll={jest.fn()}
        actions={mockActions}
      />
    )

    expect(screen.getByText('42 of 150 selected')).toBeInTheDocument()
  })
})

