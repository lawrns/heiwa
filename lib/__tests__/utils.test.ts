// Unit tests for utility functions
// Since we don't have custom utils yet, this tests the basic functionality

import { cn } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('filters out falsy values', () => {
    expect(cn('class1', null, undefined, '', 'class2')).toBe('class1 class2')
  })

  it('handles single class', () => {
    expect(cn('single-class')).toBe('single-class')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

