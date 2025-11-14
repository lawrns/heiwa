'use client'

import { useState, useEffect } from 'react'
import { Clock, User, Eye, RotateCcw, Trash2 } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import { useSupabase } from '@/lib/supabase-context'

interface VersionEntry {
  id: string
  page_slug: string
  content: any
  version: number
  created_by: string
  created_at: string
  notes?: string
}

interface VersionHistoryProps {
  pageSlug: string
  isOpen: boolean
  onClose: () => void
  onRestore: (version: VersionEntry) => void
}

export default function VersionHistory({
  pageSlug,
  isOpen,
  onClose,
  onRestore
}: VersionHistoryProps) {
  const { supabaseAdmin } = useSupabase()
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    if (isOpen && pageSlug) {
      fetchVersions()
    }
  }, [isOpen, pageSlug])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabaseAdmin
        .from('page_versions')
        .select('*')
        .eq('page_slug', pageSlug)
        .order('version', { ascending: false })
        .limit(50)

      if (error) throw error

      setVersions(data || [])
    } catch (err) {
      setError('Failed to load version history')
      console.error('Error fetching versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (version: VersionEntry) => {
    if (!confirm('Are you sure you want to restore this version? This will replace the current content.')) {
      return
    }

    try {
      setRestoring(true)
      await onRestore(version)
      onClose()
    } catch (err) {
      setError('Failed to restore version')
    } finally {
      setRestoring(false)
    }
  }

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) {
      return
    }

    try {
      const { error } = await supabaseAdmin
        .from('page_versions')
        .delete()
        .eq('id', versionId)

      if (error) throw error

      setVersions(prev => prev.filter(v => v.id !== versionId))
    } catch (err) {
      setError('Failed to delete version')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title="Version History"
        size="lg"
      >
        <div className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </AdminModal>
    )
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
      size="xl"
    >
      <div className="space-y-6">
        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Versions List */}
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No versions yet</h3>
            <p className="text-gray-500">
              Version history will appear here as you make changes to the page.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center flex-1">
                  {/* Version Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium text-gray-900">
                        Version {version.version}
                      </span>
                      {version.notes && (
                        <span className="text-sm text-gray-500">
                          {version.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {getInitials(version.created_by)}
                        </div>
                        {version.created_by}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(version.created_at)}
                      </div>
                      <div>
                        {formatDate(version.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVersion(version)
                      setShowPreview(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </AdminButton>
                  
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version)}
                    disabled={restoring}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </AdminButton>
                  
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVersion(version.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p>
            Version history is automatically created when you save changes. 
            You can restore previous versions or preview their content.
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedVersion && (
        <AdminModal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false)
            setSelectedVersion(null)
          }}
          title={`Preview Version ${selectedVersion.version}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Version Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <span className="ml-2 text-gray-900">{selectedVersion.created_by}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created at:</span>
                  <span className="ml-2 text-gray-900">{formatDate(selectedVersion.created_at)}</span>
                </div>
                {selectedVersion.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Notes:</span>
                    <span className="ml-2 text-gray-900">{selectedVersion.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
              <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedVersion.content, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end space-x-3">
              <AdminButton
                variant="outline"
                onClick={() => {
                  setShowPreview(false)
                  setSelectedVersion(null)
                }}
              >
                Close
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={() => handleRestore(selectedVersion)}
                disabled={restoring}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore This Version
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}
    </AdminModal>
  )
}
