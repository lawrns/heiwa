// Firebase imports removed - using Supabase

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
      console.warn('Cannot log audit event: Firestore not available')
      return
    }

    const auditCollection = collection(db, 'auditLogs')
    await addDoc(auditCollection, {
      ...auditEntry,
      timestamp: Timestamp.fromDate(auditEntry.timestamp)
    })

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
      console.warn('Cannot fetch audit logs: Firestore not available')
      return []
    }

    let q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )

    // Add filters
    const constraints = []

    if (userId) {
      constraints.push(where('userId', '==', userId))
    }

    if (action) {
      constraints.push(where('action', '==', action))
    }

    if (resource) {
      constraints.push(where('resource', '==', resource))
    }

    if (startDate) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(startDate)))
    }

    if (endDate) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(endDate)))
    }

    if (constraints.length > 0) {
      q = query(collection(db, 'auditLogs'), ...constraints, orderBy('timestamp', 'desc'), limit(limitCount))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success,
        errorMessage: data.errorMessage
      } as AuditLogEntry
    })

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

