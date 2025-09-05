import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAuth } from 'firebase/auth'

export interface AuditEntry {
  id?: string
  timestamp: Date
  adminId: string
  adminEmail: string
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'ERASURE'
  entity: 'client' | 'booking' | 'room' | 'surfcamp' | 'addon' | 'admin' | 'consent' | 'system'
  entityId: string
  previousData?: DocumentData
  newData?: DocumentData
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
    previousData?: DocumentData
    newData?: DocumentData
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
      console.warn('Cannot log audit entry: Firestore not available')
      return
    }

    const auditCollection = collection(db, 'auditLogs')
    await addDoc(auditCollection, {
      ...auditEntry,
      timestamp: Timestamp.fromDate(auditEntry.timestamp)
    })

  } catch (error) {
    console.error('Failed to log audit entry:', error)
  }
}

// Calculate diff between two objects
function calculateDiff(oldData: DocumentData, newData: DocumentData): Record<string, { old: any, new: any }> {
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
      console.warn('Cannot fetch audit entries: Firestore not available')
      return []
    }

    let q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(options.limitCount || 50)
    )

    // Add filters
    const constraints = []

    if (options.adminId) {
      constraints.push(where('adminId', '==', options.adminId))
    }

    if (options.actionType) {
      constraints.push(where('actionType', '==', options.actionType))
    }

    if (options.entity) {
      constraints.push(where('entity', '==', options.entity))
    }

    if (options.entityId) {
      constraints.push(where('entityId', '==', options.entityId))
    }

    if (options.dataSubjectId) {
      constraints.push(where('compliance.dataSubjectId', '==', options.dataSubjectId))
    }

    if (options.gdprRelevantOnly) {
      constraints.push(where('compliance.gdprRelevant', '==', true))
    }

    if (constraints.length > 0) {
      q = query(collection(db, 'auditLogs'), ...constraints, orderBy('timestamp', 'desc'), limit(options.limitCount || 50))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        adminId: data.adminId,
        adminEmail: data.adminEmail,
        actionType: data.actionType,
        entity: data.entity,
        entityId: data.entityId,
        previousData: data.previousData,
        newData: data.newData,
        diff: data.diff,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        compliance: data.compliance,
        metadata: data.metadata
      } as AuditEntry
    })

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
    getPreviousData?: (args: T) => DocumentData
    getNewData?: (result: R) => DocumentData
    legalBasis?: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation'
    getUserId?: (args: T) => string
    getUserEmail?: (args: T) => string
  }
) {
  return async (...args: T): Promise<R> => {
    let previousData: DocumentData | undefined
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

