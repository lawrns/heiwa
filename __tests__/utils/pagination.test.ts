describe('Pagination Utilities', () => {
  describe('Pagination Calculation', () => {
    it('calculates correct page count', () => {
      const totalItems = 100
      const itemsPerPage = 10
      const pageCount = Math.ceil(totalItems / itemsPerPage)

      expect(pageCount).toBe(10)
    })

    it('handles remainder items', () => {
      const totalItems = 95
      const itemsPerPage = 10
      const pageCount = Math.ceil(totalItems / itemsPerPage)

      expect(pageCount).toBe(10)
    })

    it('handles single page', () => {
      const totalItems = 5
      const itemsPerPage = 10
      const pageCount = Math.ceil(totalItems / itemsPerPage)

      expect(pageCount).toBe(1)
    })

    it('handles empty list', () => {
      const totalItems = 0
      const itemsPerPage = 10
      const pageCount = Math.ceil(totalItems / itemsPerPage) || 1

      expect(pageCount).toBe(1)
    })
  })

  describe('Pagination Slicing', () => {
    it('slices items for first page', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
      const currentPage = 1
      const itemsPerPage = 10

      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage
      const sliced = items.slice(start, end)

      expect(sliced.length).toBe(10)
      expect(sliced[0].id).toBe(1)
      expect(sliced[9].id).toBe(10)
    })

    it('slices items for middle page', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
      const currentPage = 5
      const itemsPerPage = 10

      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage
      const sliced = items.slice(start, end)

      expect(sliced.length).toBe(10)
      expect(sliced[0].id).toBe(41)
      expect(sliced[9].id).toBe(50)
    })

    it('slices items for last page with remainder', () => {
      const items = Array.from({ length: 95 }, (_, i) => ({ id: i + 1 }))
      const currentPage = 10
      const itemsPerPage = 10

      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage
      const sliced = items.slice(start, end)

      expect(sliced.length).toBe(5)
      expect(sliced[0].id).toBe(91)
      expect(sliced[4].id).toBe(95)
    })
  })

  describe('URL State Management', () => {
    it('creates pagination URL params', () => {
      const page = 2
      const search = 'john'
      const status = 'active'

      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('search', search)
      params.set('status', status)

      expect(params.get('page')).toBe('2')
      expect(params.get('search')).toBe('john')
      expect(params.get('status')).toBe('active')
    })

    it('parses pagination URL params', () => {
      const queryString = 'page=3&search=jane&status=inactive'
      const params = new URLSearchParams(queryString)

      expect(params.get('page')).toBe('3')
      expect(params.get('search')).toBe('jane')
      expect(params.get('status')).toBe('inactive')
    })

    it('handles missing params', () => {
      const params = new URLSearchParams()

      expect(params.get('page')).toBeNull()
      expect(params.get('search')).toBeNull()
    })
  })
})
