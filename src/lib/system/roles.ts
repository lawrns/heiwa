import { supabase } from '@/lib/supabase/client'

// Role constants
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  VIEWER: 'viewer'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Permission levels (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPERADMIN]: 3
} as const

// Custom claims interface for Supabase Auth
export interface UserClaims {
  role?: Role
  permissions?: string[]
  createdAt?: number
  updatedAt?: number
}

// Get user's role from Supabase Auth metadata
export async function getUserRole(uid: string): Promise<Role | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(uid)

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    const userMetadata = data.user?.user_metadata as UserClaims
    return userMetadata?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Get current user's role from Supabase Auth session (client-side)
export async function getCurrentUserRole(): Promise<Role | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return null
    }

    const userMetadata = session.user.user_metadata as UserClaims
    return userMetadata?.role || null
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

// Check if user has a specific role
export async function hasRole(requiredRole: Role): Promise<boolean> {
  try {
    const userRole = await getCurrentUserRole()
    if (!userRole) return false

    const userLevel = ROLE_HIERARCHY[userRole]
    const requiredLevel = ROLE_HIERARCHY[requiredRole]

    return userLevel >= requiredLevel
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

// Check if user is superadmin
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(ROLES.SUPERADMIN)
}

// Check if user is admin or higher
export async function isAdmin(): Promise<boolean> {
  return hasRole(ROLES.ADMIN)
}

// Check if user is viewer or higher
export async function isViewer(): Promise<boolean> {
  return hasRole(ROLES.VIEWER)
}

// Get all available roles
export function getAvailableRoles(): Role[] {
  return Object.values(ROLES)
}

// Get role display name
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case ROLES.SUPERADMIN:
      return 'Super Admin'
    case ROLES.ADMIN:
      return 'Admin'
    case ROLES.VIEWER:
      return 'Viewer'
    default:
      return 'Unknown'
  }
}

// Get role description
export function getRoleDescription(role: Role): string {
  switch (role) {
    case ROLES.SUPERADMIN:
      return 'Full system access including user management, backups, and system configuration'
    case ROLES.ADMIN:
      return 'Manage bookings, clients, and rooms with read access to analytics'
    case ROLES.VIEWER:
      return 'Read-only access to dashboard and reports'
    default:
      return 'Unknown role'
  }
}

// Check if a role can be assigned by another role
export function canAssignRole(assignerRole: Role, targetRole: Role): boolean {
  const assignerLevel = ROLE_HIERARCHY[assignerRole]
  const targetLevel = ROLE_HIERARCHY[targetRole]

  // Only superadmin can assign superadmin role
  if (targetRole === ROLES.SUPERADMIN && assignerRole !== ROLES.SUPERADMIN) {
    return false
  }

  // Cannot assign role higher than or equal to your own level
  return assignerLevel > targetLevel
}

// Validate role string
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role)
}

// Get role color for UI
export function getRoleColor(role: Role): string {
  switch (role) {
    case ROLES.SUPERADMIN:
      return 'bg-red-100 text-red-800'
    case ROLES.ADMIN:
      return 'bg-blue-100 text-blue-800'
    case ROLES.VIEWER:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

