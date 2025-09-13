import { db } from '../../../lib/supabase'

export interface AuditEntry {
  id?: string
  timestamp: Date
  adminId: string
  adminEmail: string
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'ERASURE'
  entity: 'client' | 'booking' | 'room' | 'surfcamp' | 'addon' | 'admin' | 'consent' | 'system'
  entityId: string
  previousData?: Record<string, any>
  newData?: Record<string, any>
  diff?: Record<string, { old: any, new: any }>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  compliance: {
    gdprRelevant: boolean
    dataSubjectId?: string
    retentionPeriod: number // days
    legalBasis?: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation'
  }
  metadata?: Record<string, any>
}

// Action types for different operations
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  EXPORT: 'EXPORT',
  ERASURE: 'ERASURE'
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

// Entity types for tracking
export const AUDIT_ENTITIES = {
  CLIENT: 'client',
  BOOKING: 'booking',
  ROOM: 'room',
  SURFCAMP: 'surfcamp',
  ADDON: 'addon',
  ADMIN: 'admin',
  CONSENT: 'consent',
  SYSTEM: 'system'
} as const

export type AuditEntity = typeof AUDIT_ENTITIES[keyof typeof AUDIT_ENTITIES]

// Log an audit entry
export async function logAuditEntry(
  actionType: AuditAction,
  entity: AuditEntity,
  entityId: string,
  userId: string,
  userEmail: string,
  options: {
    previousData?: Record<string, any>
    newData?: Record<string, any>
    dataSubjectId?: string
    legalBasis?: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation'
    metadata?: Record<string, any>
  } = {}
): Promise<void> {
  try {
    if (!userId || !userEmail) {
      console.warn('Cannot log audit entry: Missing user information')
      return
    }

    // Calculate diff if both previous and new data are provided
    let diff: Record<string, { old: any, new: any }> | undefined
    if (options.previousData && options.newData) {
      diff = calculateDiff(options.previousData, options.newData)
    }

    const auditEntry: Omit<AuditEntry, 'id'> = {
      timestamp: new Date(),
      adminId: userId,
      adminEmail: userEmail,
      actionType,
      entity,
      entityId,
      previousData: options.previousData,
      newData: options.newData,
      diff,
      compliance: {
        gdprRelevant: isGDPRRelevant(entity, actionType),
        dataSubjectId: options.dataSubjectId,
        retentionPeriod: getRetentionPeriod(entity),
        legalBasis: options.legalBasis
      },
      metadata: options.metadata
    }

    if (!db) {
      console.warn('Cannot log audit entry: Supabase not available')
      return
    }

    const { error } = await db.from('audit_logs').insert(auditEntry)

    if (error) {
      console.error('Failed to insert audit entry:', error)
    }

  } catch (error) {
    console.error('Failed to log audit entry:', error)
  }
}

// Calculate diff between two objects
function calculateDiff(oldData: Record<string, any>, newData: Record<string, any>): Record<string, { old: any, new: any }> {
  const diff: Record<string, { old: any, new: any }> = {}

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

  for (const key of allKeys) {
    const oldValue = oldData[key]
    const newValue = newData[key]

    // Check if values are different (deep comparison for objects)
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff[key] = { old: oldValue, new: newValue }
    }
  }

  return diff
}

// Check if an entity/action is GDPR relevant
function isGDPRRelevant(entity: AuditEntity, actionType: AuditAction): boolean {
  // Personal data entities are always GDPR relevant
  const personalDataEntities = ['client', 'booking', 'consent']
  return personalDataEntities.includes(entity) || actionType === 'EXPORT' || actionType === 'ERASURE'
}

// Get retention period for different entities (in days)
function getRetentionPeriod(entity: AuditEntity): number {
  switch (entity) {
    case 'client':
    case 'consent':
      return 2555 // 7 years for personal data
    case 'booking':
      return 2555 // 7 years for financial records
    case 'admin':
      return 1825 // 5 years for admin actions
    default:
      return 1095 // 3 years default
  }
}

// Get audit entries with filtering
export async function getAuditEntries(
  options: {
    limitCount?: number
    adminId?: string
    actionType?: AuditAction
    entity?: AuditEntity
    entityId?: string
    dataSubjectId?: string
    startDate?: Date
    endDate?: Date
    gdprRelevantOnly?: boolean
  } = {}
): Promise<AuditEntry[]> {
  try {
    if (!db) {
      console.warn('Cannot fetch audit entries: Supabase not available')
      return []
    }

    let query = db.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(options.limitCount || 50)

    // Add filters
    if (options.adminId) {
      query = query.eq('adminId', options.adminId)
    }

    if (options.actionType) {
      query = query.eq('actionType', options.actionType)
    }

    if (options.entity) {
      query = query.eq('entity', options.entity)
    }

    if (options.entityId) {
      query = query.eq('entityId', options.entityId)
    }

    if (options.dataSubjectId) {
      query = query.eq('compliance->>dataSubjectId', options.dataSubjectId)
    }

    if (options.gdprRelevantOnly) {
      query = query.eq('compliance->>gdprRelevant', 'true')
    }

    if (options.startDate) {
      query = query.gte('timestamp', options.startDate.toISOString())
    }

    if (options.endDate) {
      query = query.lte('timestamp', options.endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch audit entries:', error)
      return []
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      timestamp: new Date(item.timestamp),
      adminId: item.adminId,
      adminEmail: item.adminEmail,
      actionType: item.actionType,
      entity: item.entity,
      entityId: item.entityId,
      previousData: item.previousData,
      newData: item.newData,
      diff: item.diff,
      ipAddress: item.ipAddress,
      userAgent: item.userAgent,
      sessionId: item.sessionId,
      compliance: item.compliance,
      metadata: item.metadata
    } as AuditEntry))

  } catch (error) {
    console.error('Failed to fetch audit entries:', error)
    return []
  }
}

// Get audit entries for a specific data subject (for GDPR requests)
export async function getDataSubjectAuditTrail(dataSubjectId: string): Promise<AuditEntry[]> {
  return getAuditEntries({
    dataSubjectId,
    gdprRelevantOnly: true,
    limitCount: 1000 // Higher limit for data export requests
  })
}

// Middleware function to wrap Firestore operations with audit logging
export function withAuditLogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: {
    actionType: AuditAction
    entity: AuditEntity
    getEntityId: (args: T, result?: R) => string
    getDataSubjectId?: (args: T, result?: R) => string
    getPreviousData?: (args: T) => Record<string, any>
    getNewData?: (result: R) => Record<string, any>
    legalBasis?: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation'
    getUserId?: (args: T) => string
    getUserEmail?: (args: T) => string
  }
) {
  return async (...args: T): Promise<R> => {
    let previousData: Record<string, any> | undefined
    let result: R

    const userId = options.getUserId?.(args) || 'system'
    const userEmail = options.getUserEmail?.(args) || 'system@heiwa.house'

    try {
      // Get previous data if available
      if (options.getPreviousData) {
        previousData = options.getPreviousData(args)
      }

      // Execute the operation
      result = await operation(...args)

      // Log successful operation
      const entityId = options.getEntityId(args, result)
      const dataSubjectId = options.getDataSubjectId?.(args, result)
      const newData = options.getNewData?.(result)

      await logAuditEntry(options.actionType, options.entity, entityId, userId, userEmail, {
        previousData,
        newData,
        dataSubjectId,
        legalBasis: options.legalBasis,
        metadata: { success: true }
      })

      return result

    } catch (error) {
      // Log failed operation
      try {
        const entityId = options.getEntityId(args)
        const dataSubjectId = options.getDataSubjectId?.(args)

        await logAuditEntry(options.actionType, options.entity, entityId, userId, userEmail, {
          previousData,
          dataSubjectId,
          legalBasis: options.legalBasis,
          metadata: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      } catch (auditError) {
        console.error('Failed to log audit entry for failed operation:', auditError)
      }

      throw error
    }
  }
}

// Utility function to generate compliance report
export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEntries: number
  gdprRelevantEntries: number
  actionsByType: Record<string, number>
  entitiesByType: Record<string, number>
  adminsByActivity: Record<string, number>
}> {
  const entries = await getAuditEntries({
    startDate,
    endDate,
    limitCount: 10000 // High limit for reports
  })

  const report = {
    totalEntries: entries.length,
    gdprRelevantEntries: entries.filter(e => e.compliance.gdprRelevant).length,
    actionsByType: {} as Record<string, number>,
    entitiesByType: {} as Record<string, number>,
    adminsByActivity: {} as Record<string, number>
  }

  entries.forEach(entry => {
    // Count actions
    report.actionsByType[entry.actionType] = (report.actionsByType[entry.actionType] || 0) + 1

    // Count entities
    report.entitiesByType[entry.entity] = (report.entitiesByType[entry.entity] || 0) + 1

    // Count admin activity
    report.adminsByActivity[entry.adminEmail] = (report.adminsByActivity[entry.adminEmail] || 0) + 1
  })

  return report
}

