'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
  EyeIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react'
import { getAuditEntries, type AuditEntry, AUDIT_ACTIONS, AUDIT_ENTITIES, type AuditAction, type AuditEntity } from '@/lib/compliance/auditTrail'
import { isSuperAdmin } from '@/lib/system/roles'

export default function AuditLogViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [adminFilter, setAdminFilter] = useState<string>('all')
  const [gdprOnly, setGdprOnly] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [totalEntries, setTotalEntries] = useState(0)

  // Selected entry for details modal
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchAuditEntries()
  }, [currentPage, actionFilter, entityFilter, adminFilter, gdprOnly])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchAuditEntries = async () => {
    if (!isSuperAdminUser) return

    try {
      setLoading(true)
      setError(null)

      const fetchedEntries = await getAuditEntries({
        limitCount: pageSize,
        actionType: actionFilter !== 'all' ? actionFilter as AuditAction : undefined,
        entity: entityFilter !== 'all' ? entityFilter as AuditEntity : undefined,
        gdprRelevantOnly: gdprOnly
      })

      // Apply client-side filtering
      let filteredEntries = fetchedEntries

      if (searchQuery) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.entity.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (adminFilter !== 'all') {
        filteredEntries = filteredEntries.filter(entry => entry.adminId === adminFilter)
      }

      setEntries(filteredEntries)
      setTotalEntries(filteredEntries.length)
    } catch (err) {
      console.error('Failed to fetch audit entries:', err)
      setError('Failed to load audit entries')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case AUDIT_ACTIONS.CREATE:
        return 'bg-green-100 text-green-800'
      case AUDIT_ACTIONS.UPDATE:
        return 'bg-blue-100 text-blue-800'
      case AUDIT_ACTIONS.DELETE:
        return 'bg-red-100 text-red-800'
      case AUDIT_ACTIONS.READ:
        return 'bg-gray-100 text-gray-800'
      case AUDIT_ACTIONS.EXPORT:
        return 'bg-purple-100 text-purple-800'
      case AUDIT_ACTIONS.ERASURE:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case AUDIT_ENTITIES.CLIENT:
        return 'bg-blue-100 text-blue-800'
      case AUDIT_ENTITIES.BOOKING:
        return 'bg-green-100 text-green-800'
      case AUDIT_ENTITIES.ROOM:
        return 'bg-yellow-100 text-yellow-800'
      case AUDIT_ENTITIES.SURFCAMP:
        return 'bg-teal-100 text-teal-800'
      case AUDIT_ENTITIES.ADDON:
        return 'bg-purple-100 text-purple-800'
      case AUDIT_ENTITIES.ADMIN:
        return 'bg-red-100 text-red-800'
      case AUDIT_ENTITIES.CONSENT:
        return 'bg-orange-100 text-orange-800'
      case AUDIT_ENTITIES.SYSTEM:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()
  }

  const formatEntity = (entity: string) => {
    return entity.charAt(0).toUpperCase() + entity.slice(1)
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
            GDPR Audit Trail
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive audit logs for GDPR compliance and security monitoring
          </p>
        </div>

        <Button
          onClick={fetchAuditEntries}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="text-sm font-medium">Entity</label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {Object.values(AUDIT_ENTITIES).map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {formatEntity(entity)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">GDPR Only</label>
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={gdprOnly}
                  onChange={(e) => setGdprOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="ml-2 text-sm">GDPR relevant only</span>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAuditEntries} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Entries</CardTitle>
          <CardDescription>
            Showing {entries.length} of {totalEntries} entries
            {gdprOnly && <Badge className="ml-2 bg-orange-100 text-orange-800">GDPR Filtered</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>GDPR</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">
                    {entry.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {entry.adminEmail}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(entry.actionType)}>
                      {formatAction(entry.actionType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEntityBadgeColor(entry.entity)}>
                      {formatEntity(entry.entity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {entry.entityId.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {entry.compliance.gdprRelevant ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Entry Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this audit entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Timestamp</label>
                              <p className="text-sm text-gray-600">{entry.timestamp.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Admin</label>
                              <p className="text-sm text-gray-600">{entry.adminEmail}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Action</label>
                              <p className="text-sm text-gray-600">{formatAction(entry.actionType)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Entity</label>
                              <p className="text-sm text-gray-600">{formatEntity(entry.entity)}</p>
                            </div>
                          </div>

                          {entry.compliance.gdprRelevant && (
                            <Alert className="border-orange-200 bg-orange-50">
                              <ShieldIcon className="h-4 w-4" />
                              <AlertDescription>
                                This entry is GDPR relevant and will be retained for {entry.compliance.retentionPeriod} days.
                              </AlertDescription>
                            </Alert>
                          )}

                          {entry.diff && Object.keys(entry.diff).length > 0 && (
                            <div>
                              <label className="text-sm font-medium">Changes Made</label>
                              <div className="mt-2 space-y-2">
                                {Object.entries(entry.diff).map(([field, change]) => (
                                  <div key={field} className="text-sm bg-gray-50 p-2 rounded">
                                    <span className="font-medium">{field}:</span>
                                    <span className="text-red-600 line-through ml-2">{JSON.stringify(change.old)}</span>
                                    <span className="text-green-600 ml-2">→ {JSON.stringify(change.new)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.metadata && (
                            <div>
                              <label className="text-sm font-medium">Metadata</label>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {entries.length === 0 && (
            <div className="text-center py-8">
              <ShieldIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Entries Found</h3>
              <p className="text-gray-600">
                No entries match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <ShieldIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>GDPR Compliance:</strong> Audit logs are automatically retained according to GDPR requirements.
          Personal data processing is logged for compliance and security purposes.
        </AlertDescription>
      </Alert>
    </div>
  )
}

