'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Clock, RotateCcw, RotateCw } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminAlert from '@/components/admin/ui/AdminAlert'

interface AutoSaveState<T> {
  data: T
  timestamp: number
  action: string
}

interface AutoSaveManagerProps<T> {
  data: T
  onSave: (data: T) => Promise<void>
  debounceMs?: number
  maxHistory?: number
}

export default function AutoSaveManager<T extends object>({
  data,
  onSave,
  debounceMs = 3000,
  maxHistory = 20
}: AutoSaveManagerProps<T>) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Undo/Redo state
  const [history, setHistory] = useState<AutoSaveState<T>[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<T>(data)

  // Add state to history
  const addToHistory = useCallback((newData: T, action: string = 'Edit') => {
    const newState: AutoSaveState<T> = {
      data: JSON.parse(JSON.stringify(newData)),
      timestamp: Date.now(),
      action
    }

    setHistory(prev => {
      // Remove any states after current index
      const newHistory = prev.slice(0, historyIndex + 1)
      // Add new state
      newHistory.push(newState)
      // Limit history size
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory)
      }
      return newHistory
    })

    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1))
  }, [historyIndex, maxHistory])

  // Update undo/redo availability
  useEffect(() => {
    setCanUndo(historyIndex > 0)
    setCanRedo(historyIndex < history.length - 1)
  }, [historyIndex, history.length])

  // Handle data changes
  const handleChange = useCallback((newData: T, action: string = 'Edit') => {
    // Clear existing save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Check if data actually changed
    if (JSON.stringify(newData) !== JSON.stringify(lastDataRef.current)) {
      setHasUnsavedChanges(true)
      setSaveStatus('idle')
      
      // Add to history for undo/redo
      addToHistory(newData, action)
      
      // Set up auto-save
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, debounceMs)
      
      lastDataRef.current = newData
    }
  }, [debounceMs, addToHistory])

  // Auto-save function
  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return

    try {
      setIsSaving(true)
      setSaveStatus('saving')
      setErrorMessage(null)

      await onSave(lastDataRef.current)
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle')
        }
      }, 3000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setErrorMessage('Auto-save failed. Please try saving manually.')
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [hasUnsavedChanges, isSaving, onSave, saveStatus])

  // Manual save function
  const handleManualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await handleAutoSave()
  }, [handleAutoSave])

  // Undo function
  const handleUndo = useCallback(() => {
    if (canUndo && historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      
      setHistoryIndex(newIndex)
      lastDataRef.current = previousState.data
      setHasUnsavedChanges(true)
      setSaveStatus('idle')
      
      // Trigger parent update
      if (window.onDataChange) {
        window.onDataChange(previousState.data, 'Undo')
      }
    }
  }, [canUndo, historyIndex, history])

  // Redo function
  const handleRedo = useCallback(() => {
    if (canRedo && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      
      setHistoryIndex(newIndex)
      lastDataRef.current = nextState.data
      setHasUnsavedChanges(true)
      setSaveStatus('idle')
      
      // Trigger parent update
      if (window.onDataChange) {
        window.onDataChange(nextState.data, 'Redo')
      }
    }
  }, [canRedo, historyIndex, history])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-4">
      {/* Save Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              saveStatus === 'saved' ? 'bg-green-500' :
              saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
              saveStatus === 'error' ? 'bg-red-500' :
              hasUnsavedChanges ? 'bg-orange-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600">
              {saveStatus === 'saved' ? 'Saved' :
               saveStatus === 'saving' ? 'Saving...' :
               saveStatus === 'error' ? 'Error' :
               hasUnsavedChanges ? 'Unsaved changes' : 'Up to date'}
            </span>
          </div>

          {/* Last Saved */}
          {lastSaved && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatTimeAgo(lastSaved)}
            </div>
          )}

          {/* History Info */}
          {history.length > 0 && (
            <div className="text-sm text-gray-500">
              History: {historyIndex + 1}/{history.length}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </AdminButton>
          
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </AdminButton>

          {/* Save Button */}
          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </AdminButton>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <AdminAlert variant="error">
          {errorMessage}
        </AdminAlert>
      )}

      {/* Success Message */}
      {saveStatus === 'saved' && (
        <AdminAlert variant="success">
          All changes saved successfully
        </AdminAlert>
      )}

      {/* Auto-save Info */}
      <div className="text-xs text-gray-500">
        Auto-save is enabled. Changes are automatically saved after {debounceMs/1000} seconds of inactivity.
      </div>
    </div>
  )
}

// Global callback for data changes
declare global {
  interface Window {
    onDataChange?: (data: unknown, action: string) => void
  }
}
