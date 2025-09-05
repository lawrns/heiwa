'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SettingsIcon,
  CreditCardIcon,
  BarChart3Icon,
  MailIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  KeyIcon
} from 'lucide-react'
import { toast } from 'react-toastify'
import { isSuperAdmin } from '@/lib/system/roles'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  status: 'active' | 'inactive' | 'misconfigured'
  requiredEnvVars: string[]
  docsUrl?: string
  configUrl?: string
}

interface IntegrationStatus {
  [key: string]: {
    enabled: boolean
    configValid: boolean
    missingVars: string[]
  }
}

export default function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [configDialog, setConfigDialog] = useState<{ open: boolean; integration: Integration | null }>({
    open: false,
    integration: null
  })

  useEffect(() => {
    checkSuperAdminStatus()
    fetchIntegrations()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock integrations data
      const mockIntegrations: Integration[] = [
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'Payment processing and subscription management',
          icon: CreditCardIcon,
          status: 'active',
          requiredEnvVars: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
          docsUrl: 'https://stripe.com/docs',
          configUrl: 'https://dashboard.stripe.com'
        },
        {
          id: 'google-analytics',
          name: 'Google Analytics',
          description: 'Website analytics and user behavior tracking',
          icon: BarChart3Icon,
          status: 'misconfigured',
          requiredEnvVars: ['GA_TRACKING_ID', 'GA_MEASUREMENT_ID'],
          docsUrl: 'https://analytics.google.com',
          configUrl: 'https://analytics.google.com'
        },
        {
          id: 'sendgrid',
          name: 'SendGrid',
          description: 'Email delivery and marketing automation',
          icon: MailIcon,
          status: 'inactive',
          requiredEnvVars: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
          docsUrl: 'https://sendgrid.com/docs',
          configUrl: 'https://app.sendgrid.com'
        },
        {
          id: 'firebase-functions',
          name: 'Firebase Functions',
          description: 'Serverless backend functions and APIs',
          icon: SettingsIcon,
          status: 'active',
          requiredEnvVars: [],
          docsUrl: 'https://firebase.google.com/docs/functions'
        }
      ]

      // Mock status data
      const mockStatus: IntegrationStatus = {
        stripe: { enabled: true, configValid: true, missingVars: [] },
        'google-analytics': { enabled: false, configValid: false, missingVars: ['GA_TRACKING_ID'] },
        sendgrid: { enabled: false, configValid: false, missingVars: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'] },
        'firebase-functions': { enabled: true, configValid: true, missingVars: [] }
      }

      // TODO: Replace with real API calls
      // const response = await fetch('/api/system/integrations')
      // const realData = await response.json()

      setIntegrations(mockIntegrations)
      setIntegrationStatus(mockStatus)
    } catch (err) {
      console.error('Failed to fetch integrations:', err)
      setError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can manage integrations')
      return
    }

    try {
      // TODO: Replace with real API call
      // await fetch(`/api/system/integrations/${integrationId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled })
      // })

      setIntegrationStatus(prev => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          enabled
        }
      }))

      toast.success(`Integration ${enabled ? 'enabled' : 'disabled'} successfully`)
    } catch (err) {
      console.error('Failed to toggle integration:', err)
      toast.error('Failed to update integration')
    }
  }

  const handleConfigureIntegration = (integration: Integration) => {
    setConfigDialog({ open: true, integration })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'misconfigured':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'inactive':
        return <AlertTriangleIcon className="w-4 h-4 text-gray-600" />
      case 'misconfigured':
        return <AlertTriangleIcon className="w-4 h-4 text-orange-600" />
      default:
        return <AlertTriangleIcon className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            Integration Management
          </h2>
          <p className="text-gray-600 mt-1">
            Configure and manage third-party integrations
          </p>
        </div>

        {isSuperAdminUser && (
          <Button
            onClick={fetchIntegrations}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Refresh Status</span>
          </Button>
        )}
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to manage integrations.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const status = integrationStatus[integration.id] || { enabled: false, configValid: false, missingVars: [] }
          const Icon = integration.icon

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1">
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.missingVars.length > 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      Missing configuration: {status.missingVars.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={status.enabled}
                      onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                      disabled={!isSuperAdminUser}
                    />
                    <Label className="text-sm">
                      {status.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>

                  {isSuperAdminUser && (
                    <div className="flex space-x-2">
                      {integration.configUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(integration.configUrl, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLinkIcon className="w-3 h-3" />
                          <span>Configure</span>
                        </Button>
                      )}

                      <Dialog open={configDialog.open && configDialog.integration?.id === integration.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigureIntegration(integration)}
                            className="flex items-center space-x-1"
                          >
                            <KeyIcon className="w-3 h-3" />
                            <span>Settings</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Configure {integration.name}</DialogTitle>
                            <DialogDescription>
                              Manage API keys and configuration for {integration.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {integration.requiredEnvVars.map((envVar) => (
                              <div key={envVar}>
                                <Label htmlFor={envVar} className="text-sm font-medium">
                                  {envVar}
                                </Label>
                                <Input
                                  id={envVar}
                                  type="password"
                                  placeholder="Enter API key..."
                                  className="mt-1"
                                />
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setConfigDialog({ open: false, integration: null })}>
                              Cancel
                            </Button>
                            <Button className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white">
                              Save Configuration
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <SettingsIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Status:</strong> {integrations.filter(i => integrationStatus[i.id]?.enabled).length} of {integrations.length} integrations are active.
          Configure API keys in your environment variables for full functionality.
        </AlertDescription>
      </Alert>
    </div>
  )
}

