"use client"

// Admin Table Component
// Reusable table component for admin interface with sorting and selection

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface AdminTableColumn<T = Record<string, unknown>> {
  key: keyof T
  title: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface AdminTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: AdminTableColumn<T>[]
  loading?: boolean
  empty?: React.ReactNode
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  onRowClick?: (row: T, index: number) => void
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
  sortable?: boolean
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
}

function AdminTable<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  empty = <div className="text-center py-8 text-gray-500">No data available</div>,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  sortColumn,
  sortDirection
}: AdminTableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<T[]>([])

  // Handle selection
  const selected = selectedRows.length > 0 ? selectedRows : internalSelected
  const handleSelectionChange = (newSelection: T[]) => {
    if (onSelectionChange) {
      onSelectionChange(newSelection)
    } else {
      setInternalSelected(newSelection)
    }
  }

  const toggleRowSelection = (row: T) => {
    const isSelected = selected.some(selectedRow => 
      JSON.stringify(selectedRow) === JSON.stringify(row)
    )
    
    if (isSelected) {
      handleSelectionChange(selected.filter(selectedRow => 
        JSON.stringify(selectedRow) !== JSON.stringify(row)
      ))
    } else {
      handleSelectionChange([...selected, row])
    }
  }

  const toggleAllSelection = () => {
    if (selected.length === data.length) {
      handleSelectionChange([])
    } else {
      handleSelectionChange([...data])
    }
  }

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (!sortable || !onSort) return

    const currentDirection = sortColumn === column ? sortDirection : undefined
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, newDirection)
  }

  // Get row class name
  const getRowClassName = (row: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index)
    }
    return cn(
      'border-b border-gray-200 hover:bg-gray-50',
      onRowClick && 'cursor-pointer',
      rowClassName
    )
  }

  // Get cell class name
  const getCellClassName = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return <div className={cn('w-full', className)}>{empty}</div>
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        {/* Header */}
        <thead className={cn('bg-gray-50 border-b border-gray-200', headerClassName)}>
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.length === data.length}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
            )}
            
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 font-medium text-gray-700',
                  getCellClassName(column.align),
                  column.sortable && sortable && 'cursor-pointer hover:bg-gray-100',
                  column.width && `w-${column.width}`
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  
                  {column.sortable && sortable && sortColumn === column.key && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={getRowClassName(row, index)}
              onClick={() => onRowClick && onRowClick(row, index)}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.some(selectedRow => 
                      JSON.stringify(selectedRow) === JSON.stringify(row)
                    )}
                    onChange={() => toggleRowSelection(row)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
              )}
              
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-sm text-gray-900',
                    getCellClassName(column.align)
                  )}
                >
                  {column.render ? (
                    column.render(row[column.key], row, index)
                  ) : (
                    String(row[column.key] ?? '')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminTable
