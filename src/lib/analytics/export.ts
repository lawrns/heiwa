import Papa from 'papaparse'

interface AnalyticsData {
  revenue: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  occupancy: Array<{
    month: string
    occupancy: number
    totalRooms: number
    occupiedRooms: number
  }>
  clients: Array<{
    month: string
    newClients: number
    totalClients: number
    heiwaHouse: number
    freedomRoutes: number
  }>
  funnel: Array<{
    stage: string
    count: number
    percentage: number
  }>
}

export async function exportAnalyticsData(): Promise<void> {
  try {
    // Mock data - will be replaced with real Firebase data
    const mockData: AnalyticsData = {
      revenue: [
        { month: 'Jan', revenue: 18500, bookings: 12 },
        { month: 'Feb', revenue: 21200, bookings: 15 },
        { month: 'Mar', revenue: 19800, bookings: 14 },
        { month: 'Apr', revenue: 22300, bookings: 18 },
        { month: 'May', revenue: 25600, bookings: 22 },
        { month: 'Jun', revenue: 24750, bookings: 20 },
        { month: 'Jul', revenue: 26800, bookings: 24 },
        { month: 'Aug', revenue: 28900, bookings: 26 },
        { month: 'Sep', revenue: 31200, bookings: 28 },
        { month: 'Oct', revenue: 33400, bookings: 31 },
        { month: 'Nov', revenue: 35800, bookings: 35 },
        { month: 'Dec', revenue: 24750, bookings: 20 }
      ],
      occupancy: [
        { month: 'Jan', occupancy: 65, totalRooms: 8, occupiedRooms: 5 },
        { month: 'Feb', occupancy: 72, totalRooms: 8, occupiedRooms: 6 },
        { month: 'Mar', occupancy: 68, totalRooms: 8, occupiedRooms: 5 },
        { month: 'Apr', occupancy: 78, totalRooms: 8, occupiedRooms: 6 },
        { month: 'May', occupancy: 82, totalRooms: 8, occupiedRooms: 7 },
        { month: 'Jun', occupancy: 85, totalRooms: 8, occupiedRooms: 7 },
        { month: 'Jul', occupancy: 88, totalRooms: 8, occupiedRooms: 7 },
        { month: 'Aug', occupancy: 91, totalRooms: 8, occupiedRooms: 7 },
        { month: 'Sep', occupancy: 78, totalRooms: 8, occupiedRooms: 6 },
        { month: 'Oct', occupancy: 72, totalRooms: 8, occupiedRooms: 6 },
        { month: 'Nov', occupancy: 68, totalRooms: 8, occupiedRooms: 5 },
        { month: 'Dec', occupancy: 75, totalRooms: 8, occupiedRooms: 6 }
      ],
      clients: [
        { month: 'Jan', newClients: 8, totalClients: 95, heiwaHouse: 5, freedomRoutes: 3 },
        { month: 'Feb', newClients: 12, totalClients: 107, heiwaHouse: 7, freedomRoutes: 5 },
        { month: 'Mar', newClients: 6, totalClients: 113, heiwaHouse: 4, freedomRoutes: 2 },
        { month: 'Apr', newClients: 15, totalClients: 128, heiwaHouse: 9, freedomRoutes: 6 },
        { month: 'May', newClients: 18, totalClients: 146, heiwaHouse: 11, freedomRoutes: 7 },
        { month: 'Jun', newClients: 14, totalClients: 160, heiwaHouse: 8, freedomRoutes: 6 },
        { month: 'Jul', newClients: 22, totalClients: 182, heiwaHouse: 13, freedomRoutes: 9 },
        { month: 'Aug', newClients: 25, totalClients: 207, heiwaHouse: 15, freedomRoutes: 10 },
        { month: 'Sep', newClients: 19, totalClients: 226, heiwaHouse: 12, freedomRoutes: 7 },
        { month: 'Oct', newClients: 16, totalClients: 242, heiwaHouse: 10, freedomRoutes: 6 },
        { month: 'Nov', newClients: 11, totalClients: 253, heiwaHouse: 7, freedomRoutes: 4 },
        { month: 'Dec', newClients: 8, totalClients: 261, heiwaHouse: 5, freedomRoutes: 3 }
      ],
      funnel: [
        { stage: 'Website Visitors', count: 1000, percentage: 100 },
        { stage: 'Leads/Inquiries', count: 350, percentage: 35 },
        { stage: 'Confirmed Bookings', count: 120, percentage: 12 }
      ]
    }

    // TODO: Replace with real Firebase data fetching
    // const response = await fetch('/api/analytics/export')
    // const realData = await response.json()

    // Create CSV content
    const csvData = []

    // Add metadata header
    csvData.push(['Heiwa House Analytics Report'])
    csvData.push(['Generated:', new Date().toISOString()])
    csvData.push(['']) // Empty row

    // Revenue Data
    csvData.push(['=== REVENUE DATA ==='])
    csvData.push(['Month', 'Revenue ($)', 'Bookings'])
    mockData.revenue.forEach(item => {
      csvData.push([item.month, item.revenue.toString(), item.bookings.toString()])
    })
    csvData.push(['']) // Empty row

    // Occupancy Data
    csvData.push(['=== OCCUPANCY DATA ==='])
    csvData.push(['Month', 'Occupancy (%)', 'Total Rooms', 'Occupied Rooms'])
    mockData.occupancy.forEach(item => {
      csvData.push([item.month, item.occupancy.toString(), item.totalRooms.toString(), item.occupiedRooms.toString()])
    })
    csvData.push(['']) // Empty row

    // Client Data
    csvData.push(['=== CLIENT ACQUISITION DATA ==='])
    csvData.push(['Month', 'New Clients', 'Total Clients', 'Heiwa House', 'Freedom Routes'])
    mockData.clients.forEach(item => {
      csvData.push([item.month, item.newClients.toString(), item.totalClients.toString(), item.heiwaHouse.toString(), item.freedomRoutes.toString()])
    })
    csvData.push(['']) // Empty row

    // Funnel Data
    csvData.push(['=== CONVERSION FUNNEL DATA ==='])
    csvData.push(['Stage', 'Count', 'Percentage (%)'])
    mockData.funnel.forEach(item => {
      csvData.push([item.stage, item.count.toString(), item.percentage.toString()])
    })

    // Convert to CSV
    const csv = Papa.unparse(csvData)

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `heiwa-analytics-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

  } catch (error) {
    console.error('Export failed:', error)
    throw new Error('Failed to export analytics data')
  }
}
