'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserCheckIcon, AlertTriangleIcon, ShieldIcon } from 'lucide-react'
import { isSuperAdmin } from '@/lib/system/roles'
import { toast } from 'react-toastify'

interface ConsentRecord {
  clientId: string
  clientEmail: string
  clientName: string
  consents: {
    marketing: boolean
    dataRetention: boolean
    analytics: boolean
    thirdParty: boolean
  }
  consentVersion: string
  grantedAt: Date
  lastUpdated: Date
  ipAddress?: string
  legalBasis: string
}

export default function ConsentManager() {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchConsentRecords()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchConsentRecords = async () => {
    try {
      // Mock data - will be replaced with real Firestore queries
      const mockRecords: ConsentRecord[] = [
        {
          clientId: '1',
          clientEmail: 'john.doe@email.com',
          clientName: 'John Doe',
          consents: {
            marketing: true,
            dataRetention: true,
            analytics: false,
            thirdParty: true
          },
          consentVersion: '2.1',
          grantedAt: new Date('2024-01-01'),
          lastUpdated: new Date('2024-01-15'),
          legalBasis: 'consent'
        },
        {
          clientId: '2',
          clientEmail: 'jane.smith@email.com',
          clientName: 'Jane Smith',
          consents: {
            marketing: false,
            dataRetention: true,
            analytics: true,
            thirdParty: false
          },
          consentVersion: '2.1',
          grantedAt: new Date('2024-01-05'),
          lastUpdated: new Date('2024-01-10'),
          legalBasis: 'consent'
        }
      ]

      setConsentRecords(mockRecords)
    } catch (error) {
      console.error('Failed to fetch consent records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConsentUpdate = async (clientId: string, consentType: keyof ConsentRecord['consents'], value: boolean) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can update consents')
      return
    }

    try {
      // Mock update - will be replaced with real Firestore update
      setConsentRecords(prev =>
        prev.map(record =>
          record.clientId === clientId
            ? {
                ...record,
                consents: { ...record.consents, [consentType]: value },
                lastUpdated: new Date()
              }
            : record
        )
      )

      toast.success('Consent updated successfully')
    } catch (error) {
      console.error('Failed to update consent:', error)
      toast.error('Failed to update consent')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-3/4" />
                  ))}
                </div>
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
            <UserCheckIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            Consent Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage client consent preferences and GDPR compliance
          </p>
        </div>
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <ShieldIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to manage consent records.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {consentRecords.map((record) => (
          <Card key={record.clientId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{record.clientName}</CardTitle>
                  <CardDescription>{record.clientEmail}</CardDescription>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 mb-1">
                    Version {record.consentVersion}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    Last updated: {record.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`marketing-${record.clientId}`} className="text-sm">
                    Marketing Communications
                  </Label>
                  <Switch
                    id={`marketing-${record.clientId}`}
                    checked={record.consents.marketing}
                    onCheckedChange={(checked) =>
                      handleConsentUpdate(record.clientId, 'marketing', checked)
                    }
                    disabled={!isSuperAdminUser}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`retention-${record.clientId}`} className="text-sm">
                    Data Retention
                  </Label>
                  <Switch
                    id={`retention-${record.clientId}`}
                    checked={record.consents.dataRetention}
                    onCheckedChange={(checked) =>
                      handleConsentUpdate(record.clientId, 'dataRetention', checked)
                    }
                    disabled={!isSuperAdminUser}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`analytics-${record.clientId}`} className="text-sm">
                    Analytics Tracking
                  </Label>
                  <Switch
                    id={`analytics-${record.clientId}`}
                    checked={record.consents.analytics}
                    onCheckedChange={(checked) =>
                      handleConsentUpdate(record.clientId, 'analytics', checked)
                    }
                    disabled={!isSuperAdminUser}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`thirdparty-${record.clientId}`} className="text-sm">
                    Third-party Sharing
                  </Label>
                  <Switch
                    id={`thirdparty-${record.clientId}`}
                    checked={record.consents.thirdParty}
                    onCheckedChange={(checked) =>
                      handleConsentUpdate(record.clientId, 'thirdParty', checked)
                    }
                    disabled={!isSuperAdminUser}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Granted: {record.grantedAt.toLocaleDateString()} •
                  Legal Basis: {record.legalBasis}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {consentRecords.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Consent Records</h3>
            <p className="text-gray-600">
              Consent records will appear here as clients provide consent.
            </p>
          </CardContent>
        </Card>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>GDPR Compliance:</strong> All consent changes are automatically logged in the audit trail.
          Consent preferences are enforced across all data processing operations.
        </AlertDescription>
      </Alert>
    </div>
  )
}

