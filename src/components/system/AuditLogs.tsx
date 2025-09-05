'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ShieldIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  EyeIcon
} from 'lucide-react'
import { getAuditLogs, type AuditLogEntry, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/system/auditLogs'
import { isSuperAdmin } from '@/lib/system/roles'
import { toast } from 'react-toastify'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [totalLogs, setTotalLogs] = useState(0)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchAuditLogs()
  }, [currentPage, actionFilter, resourceFilter, userFilter])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchAuditLogs = async () => {
    if (!isSuperAdminUser) return

    try {
      setLoading(true)
      setError(null)

      // Mock data - will be replaced with real Firestore calls
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          userId: 'user1',
          userEmail: 'admin@heiwa.house',
          action: AUDIT_ACTIONS.USER_CREATED,
          resource: AUDIT_RESOURCES.USER,
          resourceId: 'user123',
          details: { role: 'admin' },
          success: true
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          userId: 'user2',
          userEmail: 'manager@heiwa.house',
          action: AUDIT_ACTIONS.BOOKING_CREATED,
          resource: AUDIT_RESOURCES.BOOKING,
          resourceId: 'booking456',
          details: { amount: 250 },
          success: true
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          userId: 'user1',
          userEmail: 'admin@heiwa.house',
          action: AUDIT_ACTIONS.LOGIN_FAILED,
          resource: AUDIT_RESOURCES.AUTH,
          success: false,
          errorMessage: 'Invalid credentials'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 14400000), // 4 hours ago
          userId: 'user1',
          userEmail: 'admin@heiwa.house',
          action: AUDIT_ACTIONS.BACKUP_CREATED,
          resource: AUDIT_RESOURCES.SYSTEM,
          resourceId: 'backup789',
          details: { size: '2.4MB' },
          success: true
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 18000000), // 5 hours ago
          userId: 'user3',
          userEmail: 'viewer@heiwa.house',
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          resource: AUDIT_RESOURCES.AUTH,
          success: true
        }
      ]

      // TODO: Replace with real Firestore calls
      // const realLogs = await getAuditLogs(pageSize, userFilter !== 'all' ? userFilter : undefined, ...)

      // Apply client-side filtering
      let filteredLogs = mockLogs

      if (searchQuery) {
        filteredLogs = filteredLogs.filter(log =>
          log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter)
      }

      if (resourceFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.resource === resourceFilter)
      }

      if (userFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.userId === userFilter)
      }

      setLogs(filteredLogs)
      setTotalLogs(filteredLogs.length)
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('success')) return 'bg-green-100 text-green-800'
    if (action.includes('deleted') || action.includes('failed')) return 'bg-red-100 text-red-800'
    if (action.includes('updated') || action.includes('changed')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getResourceBadgeColor = (resource: string) => {
    switch (resource) {
      case AUDIT_RESOURCES.USER: return 'bg-purple-100 text-purple-800'
      case AUDIT_RESOURCES.BOOKING: return 'bg-blue-100 text-blue-800'
      case AUDIT_RESOURCES.SYSTEM: return 'bg-orange-100 text-orange-800'
      case AUDIT_RESOURCES.CONFIG: return 'bg-green-100 text-green-800'
      case AUDIT_RESOURCES.AUTH: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || action
  }

  if (!isSuperAdminUser) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          Access denied. Only super administrators can view audit logs.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
            <ShieldIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            Security Audit Logs
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and track all administrative actions and system events
          </p>
        </div>

        <Button
          onClick={fetchAuditLogs}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FilterIcon className="w-5 h-5 text-oceanBlue-600 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.values(AUDIT_ACTIONS).map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Resource</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {Object.values(AUDIT_RESOURCES).map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {/* TODO: Populate with actual users */}
                  <SelectItem value="user1">admin@heiwa.house</SelectItem>
                  <SelectItem value="user2">manager@heiwa.house</SelectItem>
                  <SelectItem value="user3">viewer@heiwa.house</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Log Entries</CardTitle>
          <CardDescription>
            Showing {logs.length} of {totalLogs} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {log.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.userEmail}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getResourceBadgeColor(log.resource)}>
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.success ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : log.errorMessage || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {logs.length === 0 && (
            <div className="text-center py-8">
              <ShieldIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
              <p className="text-gray-600">
                No logs match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Audit Logging:</strong> All administrative actions are automatically logged for security and compliance purposes.
          Logs are retained for 2 years and are only accessible to super administrators.
        </AlertDescription>
      </Alert>
    </div>
  )
}

