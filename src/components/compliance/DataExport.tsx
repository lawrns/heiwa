'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DownloadIcon,
  SearchIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon
} from 'lucide-react'
import { logAuditEntry, AUDIT_ACTIONS, AUDIT_ENTITIES } from '@/lib/compliance/auditTrail'
import { isSuperAdmin } from '@/lib/system/roles'
import { toast } from 'react-toastify'

interface ClientData {
  id: string
  name: string
  email: string
  phone: string
  createdAt: Date
  lastBooking?: Date
  totalBookings: number
  totalSpent: number
}

interface ExportRequest {
  id: string
  clientId: string
  clientEmail: string
  requestedAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt?: Date
}

export default function DataExport() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchClients()
    fetchExportRequests()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchClients = async () => {
    try {
      // Mock data - will be replaced with real Firestore queries
      const mockClients: ClientData[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          createdAt: new Date('2023-06-15'),
          lastBooking: new Date('2024-01-10'),
          totalBookings: 5,
          totalSpent: 2500
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0456',
          createdAt: new Date('2023-08-22'),
          lastBooking: new Date('2024-01-08'),
          totalBookings: 3,
          totalSpent: 1800
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.j@email.com',
          phone: '+1-555-0789',
          createdAt: new Date('2023-09-10'),
          lastBooking: new Date('2024-01-05'),
          totalBookings: 8,
          totalSpent: 4200
        }
      ]

      setClients(mockClients)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load client data')
    }
  }

  const fetchExportRequests = async () => {
    try {
      // Mock data - will be replaced with real Firestore queries
      const mockRequests: ExportRequest[] = [
        {
          id: 'req1',
          clientId: '1',
          clientEmail: 'john.doe@email.com',
          requestedAt: new Date('2024-01-15T10:30:00'),
          status: 'completed',
          downloadUrl: '#',
          expiresAt: new Date('2024-01-22T10:30:00')
        },
        {
          id: 'req2',
          clientId: '2',
          clientEmail: 'jane.smith@email.com',
          requestedAt: new Date('2024-01-14T14:20:00'),
          status: 'processing'
        }
      ]

      setExportRequests(mockRequests)
    } catch (error) {
      console.error('Failed to fetch export requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportRequest = async (client: ClientData) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can process data export requests')
      return
    }

    try {
      setIsExporting(true)

      // Create export request record
      const exportRequest: ExportRequest = {
        id: `req${Date.now()}`,
        clientId: client.id,
        clientEmail: client.email,
        requestedAt: new Date(),
        status: 'processing'
      }

      setExportRequests(prev => [...prev, exportRequest])

      // Mock data collection and export process
      const clientData = {
        personalInfo: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          createdAt: client.createdAt,
          lastBooking: client.lastBooking
        },
        bookingHistory: [
          // Mock booking data would be collected here
        ],
        paymentHistory: [
          // Mock payment data would be collected here
        ],
        auditTrail: [
          // Mock audit entries for this client
        ],
        consentHistory: [
          // Mock consent preferences
        ]
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update request status
      setExportRequests(prev =>
        prev.map(req =>
          req.id === exportRequest.id
            ? {
                ...req,
                status: 'completed' as const,
                downloadUrl: '#',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
              }
            : req
        )
      )

      // Log the export in audit trail
      await logAuditEntry(
        AUDIT_ACTIONS.EXPORT,
        AUDIT_ENTITIES.CLIENT,
        client.id,
        {
          exportType: 'subject_access_request',
          dataCategories: ['personal_info', 'booking_history', 'payment_history', 'audit_trail', 'consent_history']
        },
        true,
        undefined,
        client.id
      )

      toast.success(`Data export completed for ${client.name}`)
    } catch (error) {
      console.error('Failed to process export:', error)
      toast.error('Failed to process data export')

      // Update request status to failed
      setExportRequests(prev =>
        prev.map(req =>
          req.id === `req${Date.now()}` ? { ...req, status: 'failed' as const } : req
        )
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadExport = (request: ExportRequest) => {
    if (request.downloadUrl && request.status === 'completed') {
      // In a real implementation, this would trigger the actual download
      toast.info(`Downloading data export for ${request.clientEmail}`)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'processing':
        return <ClockIcon className="w-4 h-4 text-blue-600" />
      case 'failed':
        return <AlertTriangleIcon className="w-4 h-4 text-red-600" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DownloadIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            GDPR Data Export
          </h2>
          <p className="text-gray-600 mt-1">
            Process subject access requests and export client data for GDPR compliance
          </p>
        </div>
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <ShieldIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to process data export requests.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Search and Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Client</CardTitle>
            <CardDescription>
              Search and select a client to process their data export request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedClient?.id === client.id
                      ? 'border-oceanBlue-500 bg-oceanBlue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      <p className="text-xs text-gray-500">
                        {client.totalBookings} bookings • ${client.totalSpent}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      ID: {client.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {selectedClient && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white"
                    disabled={!isSuperAdminUser || isExporting}
                  >
                    {isExporting ? 'Processing...' : `Export Data for ${selectedClient.name}`}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Data Export</DialogTitle>
                    <DialogDescription>
                      This will create a comprehensive export of all personal data for {selectedClient.name}.
                      The export will include personal information, booking history, payment records, and audit trail.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <FileTextIcon className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Data Included:</strong> Personal info, booking history, payment records, consent preferences, and audit trail.
                        The export will be available for download for 7 days.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button
                      onClick={() => handleExportRequest(selectedClient)}
                      disabled={isExporting}
                      className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white"
                      data-testid="data-export"
                    >
                      {isExporting ? 'Processing...' : 'Confirm Export'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Export Requests History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Requests</CardTitle>
            <CardDescription>
              History of data export requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{request.clientEmail}</p>
                    <p className="text-sm text-gray-600">
                      Requested: {request.requestedAt.toLocaleString()}
                    </p>
                    {request.expiresAt && (
                      <p className="text-xs text-gray-500">
                        Expires: {request.expiresAt.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </Badge>
                    {request.status === 'completed' && request.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadExport(request)}
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {exportRequests.length === 0 && (
                <div className="text-center py-8">
                  <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Export Requests</h3>
                  <p className="text-gray-600">
                    Export requests will appear here when processed.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>GDPR Compliance:</strong> Data exports are automatically logged in the audit trail and include
          all personal data categories. Exports are securely encrypted and available for download for 7 days.
        </AlertDescription>
      </Alert>
    </div>
  )
}

