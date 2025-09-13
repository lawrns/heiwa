import { db } from '@/lib/supabase'

export interface AuditLogEntry {
  id?: string
  timestamp: Date
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

// Log an audit event
export async function logAuditEvent(
  action: string,
  resource: string,
  userId: string,
  userEmail: string,
  resourceId?: string,
  details?: Record<string, any>,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  try {
    if (!userId || !userEmail) {
      console.warn('Cannot log audit event: Missing user information')
      return
    }

    const auditEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date(),
      userId: userId,
      userEmail: userEmail,
      action,
      resource,
      resourceId,
      details,
      success,
      errorMessage
    }

    if (!db) {
      console.warn('Cannot log audit event: Supabase not available')
      return
    }

    const { error } = await db.from('audit_logs').insert(auditEntry)

    if (error) {
      console.error('Failed to insert audit log:', error)
    }

  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

// Get audit logs with optional filtering
export async function getAuditLogs(
  limitCount: number = 50,
  userId?: string,
  action?: string,
  resource?: string,
  startDate?: Date,
  endDate?: Date
): Promise<AuditLogEntry[]> {
  try {
    if (!db) {
      console.warn('Cannot fetch audit logs: Supabase not available')
      return []
    }

    let query = db.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(limitCount)

    // Add filters
    if (userId) {
      query = query.eq('userId', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (resource) {
      query = query.eq('resource', resource)
    }

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      timestamp: new Date(item.timestamp),
      userId: item.userId,
      userEmail: item.userEmail,
      action: item.action,
      resource: item.resource,
      resourceId: item.resourceId,
      details: item.details,
      ipAddress: item.ipAddress,
      userAgent: item.userAgent,
      success: item.success,
      errorMessage: item.errorMessage
    } as AuditLogEntry))

  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: 'user.created',
  USER_DELETED: 'user.deleted',
  USER_ROLE_CHANGED: 'user.role_changed',

  // Authentication
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',

  // Bookings
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_DELETED: 'booking.deleted',

  // System
  BACKUP_CREATED: 'system.backup_created',
  BACKUP_RESTORED: 'system.backup_restored',
  INTEGRATION_ENABLED: 'system.integration_enabled',
  INTEGRATION_DISABLED: 'system.integration_disabled',

  // Configuration
  SETTINGS_CHANGED: 'config.settings_changed'
} as const

// Common resources
export const AUDIT_RESOURCES = {
  USER: 'user',
  BOOKING: 'booking',
  SYSTEM: 'system',
  CONFIG: 'config',
  AUTH: 'auth'
} as const

