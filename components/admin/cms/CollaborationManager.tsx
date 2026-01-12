'use client'

import { useState, useEffect, useRef } from 'react'
import { Users, MessageSquare, Lock, Unlock, AlertCircle } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import AdminAlert from '@/components/admin/ui/AdminAlert'

interface ActiveUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  cursor?: {
    section: string
    position: number
  }
  lastSeen: Date
}

interface Comment {
  id: string
  userId: string
  userName: string
  sectionId: string
  content: string
  createdAt: Date
  resolved: boolean
}

interface CollaborationManagerProps {
  pageSlug: string
  currentUser: {
    id: string
    name: string
    email: string
  }
  isLocked: boolean
  onLockToggle: (locked: boolean) => void
}

export default function CollaborationManager({
  pageSlug,
  currentUser,
  isLocked,
  onLockToggle
}: CollaborationManagerProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [showUsers, setShowUsers] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Generate random color for user
  const generateUserColor = () => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = () => {
      try {
        // For demo purposes, we'll simulate WebSocket connection
        // In production, this would connect to your WebSocket server
        setConnectionError(null)
        
        // Simulate active users
        setActiveUsers([
          {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            color: generateUserColor(),
            lastSeen: new Date()
          }
        ])

        // Start heartbeat
        heartbeatRef.current = setInterval(() => {
          // Send heartbeat to WebSocket server
          console.log('Heartbeat sent')
        }, 30000)

      } catch (error) {
        console.error('WebSocket connection failed:', error)
        setConnectionError('Failed to connect to collaboration server')
      }
    }

    initWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [currentUser])

  // Handle lock toggle
  const handleLockToggle = () => {
    const newLockState = !isLocked
    onLockToggle(newLockState)
    
    // Notify other users
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'lock_change',
        pageSlug,
        locked: newLockState,
        userId: currentUser.id
      }))
    }
  }

  // Add comment
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedSection) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      sectionId: selectedSection,
      content: newComment.trim(),
      createdAt: new Date(),
      resolved: false
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
    setSelectedSection('')

    // Send to WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'new_comment',
        pageSlug,
        comment
      }))
    }
  }

  // Resolve comment
  const handleResolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(c => c.id === commentId ? { ...c, resolved: true } : c)
    )

    // Send to WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'resolve_comment',
        pageSlug,
        commentId,
        userId: currentUser.id
      }))
    }
  }

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const unresolvedComments = comments.filter(c => !c.resolved)

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      {connectionError && (
        <AdminAlert variant="error">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {connectionError}
          </div>
        </AdminAlert>
      )}

      {/* Collaboration Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Active Users */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 3).map(user => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {getUserInitials(user.name)}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowUsers(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {activeUsers.length} active
            </button>
          </div>

          {/* Comments */}
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setShowComments(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {unresolvedComments.length} comments
            </button>
          </div>

          {/* Page Lock Status */}
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <Lock className="w-4 h-4 text-orange-500" />
            ) : (
              <Unlock className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm text-gray-600">
              {isLocked ? 'Page locked' : 'Page unlocked'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={handleLockToggle}
          >
            {isLocked ? (
              <>
                <Unlock className="w-4 h-4 mr-1" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-1" />
                Lock
              </>
            )}
          </AdminButton>
        </div>
      </div>

      {/* Active Users Modal */}
      <AdminModal
        isOpen={showUsers}
        onClose={() => setShowUsers(false)}
        title="Active Users"
        size="md"
      >
        <div className="space-y-3">
          {activeUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active users</p>
          ) : (
            activeUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {getUserInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(user.lastSeen)}
                </div>
              </div>
            ))
          )}
        </div>
      </AdminModal>

      {/* Comments Modal */}
      <AdminModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        title="Comments"
        size="lg"
      >
        <div className="space-y-4">
          {/* Add Comment */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Comment</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                placeholder="Section ID (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <AdminButton
                variant="primary"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Add Comment
              </AdminButton>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-4 border rounded-lg ${
                    comment.resolved ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        {comment.sectionId && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {comment.sectionId}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    {!comment.resolved && (
                      <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveComment(comment.id)}
                      >
                        Resolve
                      </AdminButton>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
