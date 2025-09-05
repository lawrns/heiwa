'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { UsersIcon, PlusIcon, TrashIcon, ShieldIcon, AlertTriangleIcon } from 'lucide-react'
import { ROLES, getRoleDisplayName, getRoleColor, canAssignRole, isSuperAdmin, type Role } from '@/lib/system/roles'
import { toast } from 'react-toastify'

interface AdminUser {
  uid: string
  email: string
  role: Role
  createdAt: Date
  lastSignIn: Date | null
  disabled: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  // Add user dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<Role>(ROLES.VIEWER)
  const [addingUser, setAddingUser] = useState(false)

  useEffect(() => {
    checkSuperAdminStatus()
    fetchAdminUsers()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const isSuper = await isSuperAdmin()
      setIsSuperAdminUser(isSuper)
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data - will be replaced with real Firebase Auth API calls
      const mockUsers: AdminUser[] = [
        {
          uid: '1',
          email: 'admin@heiwa.house',
          role: ROLES.SUPERADMIN,
          createdAt: new Date('2024-01-01'),
          lastSignIn: new Date(),
          disabled: false
        },
        {
          uid: '2',
          email: 'manager@heiwa.house',
          role: ROLES.ADMIN,
          createdAt: new Date('2024-01-15'),
          lastSignIn: new Date(Date.now() - 86400000), // 1 day ago
          disabled: false
        },
        {
          uid: '3',
          email: 'viewer@heiwa.house',
          role: ROLES.VIEWER,
          createdAt: new Date('2024-02-01'),
          lastSignIn: new Date(Date.now() - 172800000), // 2 days ago
          disabled: false
        }
      ]

      // TODO: Replace with real Firebase Auth API calls
      // const response = await fetch('/api/system/admin-users')
      // const realUsers = await response.json()

      setUsers(mockUsers)
    } catch (err) {
      console.error('Failed to fetch admin users:', err)
      setError('Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!isSuperAdminUser) {
      toast.error('Only super admins can add users')
      return
    }

    try {
      setAddingUser(true)

      // TODO: Replace with real Firebase Auth API call
      // const response = await fetch('/api/system/admin-users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: newUserEmail, role: newUserRole })
      // })

      // Mock successful addition
      const newUser: AdminUser = {
        uid: Date.now().toString(),
        email: newUserEmail,
        role: newUserRole,
        createdAt: new Date(),
        lastSignIn: null,
        disabled: false
      }

      setUsers(prev => [...prev, newUser])
      setNewUserEmail('')
      setNewUserRole(ROLES.VIEWER)
      setIsAddDialogOpen(false)
      toast.success(`User ${newUserEmail} added successfully`)
    } catch (err) {
      console.error('Failed to add user:', err)
      toast.error('Failed to add user')
    } finally {
      setAddingUser(false)
    }
  }

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can remove users')
      return
    }

    if (!confirm(`Are you sure you want to remove ${userEmail} from admin access?`)) {
      return
    }

    try {
      // TODO: Replace with real Firebase Auth API call
      // await fetch(`/api/system/admin-users/${userId}`, { method: 'DELETE' })

      setUsers(prev => prev.filter(user => user.uid !== userId))
      toast.success(`User ${userEmail} removed successfully`)
    } catch (err) {
      console.error('Failed to remove user:', err)
      toast.error('Failed to remove user')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (!isSuperAdminUser) {
      toast.error('Only super admins can update roles')
      return
    }

    const user = users.find(u => u.uid === userId)
    if (!user) return

    if (!canAssignRole(ROLES.SUPERADMIN, newRole)) {
      toast.error('You cannot assign this role')
      return
    }

    try {
      // TODO: Replace with real Firebase Auth API call
      // await fetch(`/api/system/admin-users/${userId}/role`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role: newRole })
      // })

      setUsers(prev => prev.map(u =>
        u.uid === userId ? { ...u, role: newRole } : u
      ))
      toast.success(`Role updated successfully`)
    } catch (err) {
      console.error('Failed to update role:', err)
      toast.error('Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
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
            <UsersIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            Admin User Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage administrative access and roles for Heiwa House system
          </p>
        </div>

        {isSuperAdminUser && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin User</DialogTitle>
                <DialogDescription>
                  Grant administrative access to a new user with specified role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="user@heiwa.house"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={newUserRole} onValueChange={(value: Role) => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ROLES).map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={addingUser}
                  className="bg-oceanBlue-600 hover:bg-oceanBlue-700 text-white"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isSuperAdminUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <ShieldIcon className="h-4 w-4" />
          <AlertDescription>
            You need super admin privileges to manage admin users.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.uid}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{user.email}</h3>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {user.createdAt.toLocaleDateString()}</p>
                    {user.lastSignIn && (
                      <p>Last sign in: {user.lastSignIn.toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {isSuperAdminUser && user.role !== ROLES.SUPERADMIN && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={user.role}
                      onValueChange={(newRole: Role) => handleUpdateRole(user.uid, newRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUser(user.uid, user.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Admin Users</h3>
            <p className="text-gray-600">
              {isSuperAdminUser
                ? 'Add your first admin user to get started.'
                : 'Contact a super admin to set up user access.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

