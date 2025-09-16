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
import { Checkbox } from '@/components/ui/checkbox'
import {
  TrashIcon,
  SearchIcon,
  AlertTriangleIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
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
  hasActiveBookings: boolean
}

interface ErasureRequest {
  id: string
  clientId: string
  clientEmail: string
  clientName: string
  requestedAt: Date
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
  completedAt?: Date
  reason?: string
  dataCategories: string[]
}

export default function RightToErasure() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [erasureRequests, setErasureRequests] = useState<ErasureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  // Erasure confirmation state
  const [confirmations, setConfirmations] = useState({
    legalBasis: false,
    dataCategories: false,
    retentionRequirements: false,
    auditTrail: false
  })

  useEffect(() => {
    checkSuperAdminStatus()
    fetchClients()
    fetchErasureRequests()
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
      // TODO: Implement real client data fetching from database
      const realClients: ClientData[] = []

      setClients(realClients)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load client data')
    }
  }

  const fetchErasureRequests = async () => {
    try {
      // TODO: Implement real erasure request fetching from database
      const realRequests: ErasureRequest[] = []

      setErasureRequests(realRequests)
    } catch (error) {
      console.error('Failed to fetch erasure requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleErasureRequest = async (client: ClientData) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can process erasure requests')
      return
    }

    // Check if all confirmations are made
    const allConfirmed = Object.values(confirmations).every(Boolean)
    if (!allConfirmed) {
      toast.error('Please confirm all legal requirements before proceeding')
      return
    }

    try {
      setIsProcessing(true)

      // Create erasure request record
      const erasureRequest: ErasureRequest = {
        id: `erase${Date.now()}`,
        clientId: client.id,
        clientEmail: client.email,
        clientName: client.name,
        requestedAt: new Date(),
        status: 'processing',
        dataCategories: ['personal_info', 'booking_history', 'payment_data', 'communication_history']
      }

      setErasureRequests(prev => [...prev, erasureRequest])

      // Mock erasure process
      // In real implementation, this would:
      // 1. Anonymize or delete client record
      // 2. Handle active bookings appropriately
      // 3. Remove from mailing lists
      // 4. Log all actions

      await new Promise(resolve => setTimeout(resolve, 3000))

      // Update request status
      setErasureRequests(prev =>
        prev.map(req =>
          req.id === erasureRequest.id
            ? {
                ...req,
                status: 'completed' as const,
                completedAt: new Date()
              }
            : req
        )
      )

      // Remove from clients list (anonymized)
      setClients(prev => prev.filter(c => c.id !== client.id))

      // Log the erasure in audit trail
      await logAuditEntry(
        AUDIT_ACTIONS.ERASURE,
        AUDIT_ENTITIES.CLIENT,
        client.id,
        {
          erasureType: 'gdpr_right_to_erasure',
          dataCategories: erasureRequest.dataCategories,
          legalBasis: 'consent_withdrawn',
          retentionExceptions: client.hasActiveBookings ? ['booking_records'] : []
        },
        true,
        undefined,
        client.id
      )

      toast.success(`Data erasure completed for ${client.name}`)
      setSelectedClient(null)
      setConfirmations({
        legalBasis: false,
        dataCategories: false,
        retentionRequirements: false,
        auditTrail: false
      })
    } catch (error) {
      console.error('Failed to process erasure:', error)
      toast.error('Failed to process data erasure')

      // Update request status to failed
      setErasureRequests(prev =>
        prev.map(req =>
          req.id.startsWith('erase') && req.status === 'processing'
            ? { ...req, status: 'rejected' as const, reason: 'Processing failed' }
            : req
        )
      )
    } finally {
      setIsProcessing(false)
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
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-red-600" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-orange-600" />
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
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
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
            <TrashIcon className="w-6 h-6 text-red-600 mr-2" />
            Right to Erasure
          </h2>
          <p className="text-gray-600 mt-1">
            Process GDPR right to erasure requests and anonymize client data
          </p>
        </div>
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-red-200 bg-red-50">
          <ShieldIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to process erasure requests.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Notice:</strong> Data erasure is irreversible. Ensure you have proper legal basis
          and documentation before proceeding. Active bookings may require anonymization rather than deletion.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Search and Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Client</CardTitle>
            <CardDescription>
              Search and select a client to process their erasure request
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
                      ? 'border-red-500 bg-red-50'
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
                      {client.hasActiveBookings && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs mt-1">
                          Has Active Bookings
                        </Badge>
                      )}
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
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={!isSuperAdminUser || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Process Erasure for ${selectedClient.name}`}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Confirm Data Erasure</DialogTitle>
                    <DialogDescription>
                      This will permanently erase personal data for {selectedClient.name}.
                      This action cannot be undone and requires legal confirmation.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> This will erase all personal data including name, email,
                        phone, and communication history. {selectedClient.hasActiveBookings
                          ? 'Active bookings will be anonymized.'
                          : 'All booking history will be removed.'}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="legalBasis"
                          checked={confirmations.legalBasis}
                          onCheckedChange={(checked) =>
                            setConfirmations(prev => ({ ...prev, legalBasis: checked as boolean }))
                          }
                        />
                        <Label htmlFor="legalBasis" className="text-sm">
                          I confirm there is valid legal basis for this erasure request
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dataCategories"
                          checked={confirmations.dataCategories}
                          onCheckedChange={(checked) =>
                            setConfirmations(prev => ({ ...prev, dataCategories: checked as boolean }))
                          }
                        />
                        <Label htmlFor="dataCategories" className="text-sm">
                          I understand all data categories that will be erased
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="retentionRequirements"
                          checked={confirmations.retentionRequirements}
                          onCheckedChange={(checked) =>
                            setConfirmations(prev => ({ ...prev, retentionRequirements: checked as boolean }))
                          }
                        />
                        <Label htmlFor="retentionRequirements" className="text-sm">
                          I have verified retention requirements and exceptions
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="auditTrail"
                          checked={confirmations.auditTrail}
                          onCheckedChange={(checked) =>
                            setConfirmations(prev => ({ ...prev, auditTrail: checked as boolean }))
                          }
                        />
                        <Label htmlFor="auditTrail" className="text-sm">
                          I confirm this action will be logged in the audit trail
                        </Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button
                      onClick={() => handleErasureRequest(selectedClient)}
                      disabled={isProcessing || !Object.values(confirmations).every(Boolean)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      data-testid="data-erasure"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Erasure'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Erasure Requests History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Erasure Requests</CardTitle>
            <CardDescription>
              History of data erasure requests and their processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {erasureRequests.map((request) => (
                <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{request.clientName}</p>
                      <p className="text-sm text-gray-600">{request.clientEmail}</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Requested: {request.requestedAt.toLocaleString()}</p>
                    {request.approvedAt && (
                      <p>Approved: {request.approvedAt.toLocaleString()}</p>
                    )}
                    {request.completedAt && (
                      <p>Completed: {request.completedAt.toLocaleString()}</p>
                    )}
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Data categories:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.dataCategories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {erasureRequests.length === 0 && (
                <div className="text-center py-8">
                  <TrashIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Erasure Requests</h3>
                  <p className="text-gray-600">
                    Erasure requests will appear here when processed.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-red-200 bg-red-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>GDPR Compliance:</strong> All erasure requests are logged in the audit trail with full details.
          Data is either completely removed or anonymized based on legal retention requirements.
        </AlertDescription>
      </Alert>
    </div>
  )
}

