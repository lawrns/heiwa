'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon
} from 'lucide-react'
import { toast } from 'react-toastify'
import { isSuperAdmin } from '@/lib/system/roles'

interface Backup {
  id: string
  name: string
  createdAt: Date
  size: string
  status: 'completed' | 'in_progress' | 'failed'
  type: 'automatic' | 'manual'
  downloadUrl?: string
}

export default function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState(false)
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchBackups()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchBackups = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data - will be replaced with real Cloud Storage API calls
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: 'heiwa-backup-2024-01-15-02-00',
          createdAt: new Date('2024-01-15T02:00:00Z'),
          size: '2.4 MB',
          status: 'completed',
          type: 'automatic',
          downloadUrl: '#'
        },
        {
          id: '2',
          name: 'heiwa-backup-2024-01-14-02-00',
          createdAt: new Date('2024-01-14T02:00:00Z'),
          size: '2.3 MB',
          status: 'completed',
          type: 'automatic',
          downloadUrl: '#'
        },
        {
          id: '3',
          name: 'heiwa-backup-manual-2024-01-13-15-30',
          createdAt: new Date('2024-01-13T15:30:00Z'),
          size: '2.5 MB',
          status: 'completed',
          type: 'manual',
          downloadUrl: '#'
        },
        {
          id: '4',
          name: 'heiwa-backup-2024-01-13-02-00',
          createdAt: new Date('2024-01-13T02:00:00Z'),
          size: '2.2 MB',
          status: 'failed',
          type: 'automatic'
        }
      ]

      // TODO: Replace with real Cloud Storage API calls
      // const response = await fetch('/api/system/backups')
      // const realBackups = await response.json()

      setBackups(mockBackups)
    } catch (err) {
      console.error('Failed to fetch backups:', err)
      setError('Failed to load backup data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can create backups')
      return
    }

    try {
      setCreatingBackup(true)

      // TODO: Replace with real Cloud Function call
      // const response = await fetch('/api/system/backups', { method: 'POST' })
      // const result = await response.json()

      // Mock successful backup creation
      toast.success('Backup creation initiated. This may take a few minutes.')

      // Refresh backups after a delay
      setTimeout(() => {
        fetchBackups()
      }, 3000)

    } catch (err) {
      console.error('Failed to create backup:', err)
      toast.error('Failed to create backup')
    } finally {
      setCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can restore backups')
      return
    }

    const backup = backups.find(b => b.id === backupId)
    if (!backup) return

    if (!confirm(`Are you sure you want to restore from ${backup.name}? This will overwrite current data.`)) {
      return
    }

    try {
      setRestoringBackup(true)
      setSelectedBackupId(backupId)

      // TODO: Replace with real Cloud Function call
      // const response = await fetch(`/api/system/backups/${backupId}/restore`, { method: 'POST' })
      // const result = await response.json()

      // Mock successful restore
      toast.success('Backup restore initiated. This may take several minutes.')

      // Refresh backups after a delay
      setTimeout(() => {
        fetchBackups()
      }, 5000)

    } catch (err) {
      console.error('Failed to restore backup:', err)
      toast.error('Failed to restore backup')
    } finally {
      setRestoringBackup(false)
      setSelectedBackupId(null)
    }
  }

  const handleDownloadBackup = async (backup: Backup) => {
    if (!backup.downloadUrl) return

    try {
      // TODO: Replace with real download logic
      // window.open(backup.downloadUrl, '_blank')
      toast.info(`Downloading ${backup.name}...`)
    } catch (err) {
      console.error('Failed to download backup:', err)
      toast.error('Failed to download backup')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <RefreshCwIcon className="w-4 h-4 text-blue-600 animate-spin" />
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
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'automatic'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800'
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
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
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
            <DatabaseIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            Backup & Restore
          </h2>
          <p className="text-gray-600 mt-1">
            Manage system backups and data restoration
          </p>
        </div>

        {isSuperAdminUser && (
          <div className="flex space-x-3">
            <Button
              onClick={fetchBackups}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white flex items-center space-x-2"
            >
              <DatabaseIcon className="w-4 h-4" />
              <span>{creatingBackup ? 'Creating...' : 'Create Backup'}</span>
            </Button>
          </div>
        )}
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to manage backups and restores.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {backups.map((backup) => (
          <Card key={backup.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{backup.name}</h3>
                    <Badge className={getTypeColor(backup.type)}>
                      {backup.type}
                    </Badge>
                    <Badge className={getStatusColor(backup.status)}>
                      {getStatusIcon(backup.status)}
                      <span className="ml-1">
                        {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {backup.createdAt.toLocaleString()}</p>
                    <p>Size: {backup.size}</p>
                  </div>
                </div>

                {isSuperAdminUser && (
                  <div className="flex items-center space-x-2">
                    {backup.status === 'completed' && backup.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup)}
                        className="flex items-center space-x-1"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={backup.status !== 'completed'}
                          className="flex items-center space-x-1"
                        >
                          <UploadIcon className="w-4 h-4" />
                          <span>Restore</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restore Backup</DialogTitle>
                          <DialogDescription>
                            This will restore the system to the state captured in {backup.name}.
                            Current data will be overwritten. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangleIcon className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="font-medium text-orange-800">Warning</p>
                                <p className="text-sm text-orange-700">
                                  This operation will overwrite all current data
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={restoringBackup && selectedBackupId === backup.id}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {restoringBackup && selectedBackupId === backup.id
                              ? 'Restoring...'
                              : 'Confirm Restore'
                            }
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {backups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DatabaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Found</h3>
            <p className="text-gray-600 mb-4">
              {isSuperAdminUser
                ? 'Create your first backup to secure your data.'
                : 'No backup data available.'
              }
            </p>
            {isSuperAdminUser && (
              <Button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white"
              >
                {creatingBackup ? 'Creating...' : 'Create First Backup'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <DatabaseIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Automated Backups:</strong> System creates daily backups at 2:00 AM UTC.
          Manual backups can be created anytime by super admins.
        </AlertDescription>
      </Alert>
    </div>
  )
}

