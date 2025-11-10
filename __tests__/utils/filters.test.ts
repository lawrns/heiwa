describe('Filter Utilities', () => {
  describe('Search Filter', () => {
    it('filters items by search term', () => {
      const items = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      ]

      const searchTerm = 'john'
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(filtered.length).toBe(2)
      expect(filtered[0].name).toBe('John Doe')
      expect(filtered[1].name).toBe('Bob Johnson')
    })

    it('returns all items when search term is empty', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      const searchTerm = ''
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(filtered.length).toBe(2)
    })

    it('returns empty array when no matches found', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      const searchTerm = 'nonexistent'
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(filtered.length).toBe(0)
    })
  })

  describe('Status Filter', () => {
    it('filters items by status', () => {
      const items = [
        { id: '1', name: 'Item 1', status: 'active' },
        { id: '2', name: 'Item 2', status: 'inactive' },
        { id: '3', name: 'Item 3', status: 'active' },
      ]

      const statusFilter = 'active'
      const filtered = items.filter(item => item.status === statusFilter)

      expect(filtered.length).toBe(2)
      expect(filtered.every(item => item.status === 'active')).toBe(true)
    })

    it('returns all items when filter is "all"', () => {
      const items = [
        { id: '1', status: 'active' },
        { id: '2', status: 'inactive' },
      ]

      const statusFilter = 'all'
      const filtered = items.filter(item => statusFilter === 'all' || item.status === statusFilter)

      expect(filtered.length).toBe(2)
    })
  })

  describe('Combined Filters', () => {
    it('applies multiple filters', () => {
      const items = [
        { id: '1', name: 'John Doe', status: 'active' as const },
        { id: '2', name: 'Jane Smith', status: 'inactive' as const },
        { id: '3', name: 'John Smith', status: 'active' as const },
      ]

      const searchTerm = 'john'
      const statusFilter: string = 'active'

      const filtered = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        return matchesSearch && matchesStatus
      })

      expect(filtered.length).toBe(2)
      expect(filtered.every(item => item.status === 'active')).toBe(true)
    })
  })
})
