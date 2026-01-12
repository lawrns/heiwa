'use client'

import { useState, useCallback, useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Quote,
  Code,
  Type
} from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  height?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  maxLength = 5000,
  height = 300
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    onChange(document.getElementById('editor')?.innerHTML || '')
  }, [onChange])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setLinkText(selection.toString())
    }
  }, [])

  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const link = document.createElement('a')
        link.href = linkUrl
        link.textContent = linkText
        link.target = '_blank'
        range.deleteContents()
        range.insertNode(link)
        onChange(document.getElementById('editor')?.innerHTML || '')
      }
    }
    setIsLinkModalOpen(false)
    setLinkUrl('')
    setLinkText('')
  }, [linkUrl, linkText, onChange])

  const formatText = useCallback((format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold')
        break
      case 'italic':
        execCommand('italic')
        break
      case 'underline':
        execCommand('underline')
        break
      case 'list':
        execCommand('insertUnorderedList')
        break
      case 'orderedList':
        execCommand('insertOrderedList')
        break
      case 'alignLeft':
        execCommand('justifyLeft')
        break
      case 'alignCenter':
        execCommand('justifyCenter')
        break
      case 'alignRight':
        execCommand('justifyRight')
        break
      case 'quote':
        execCommand('formatBlock', 'blockquote')
        break
      case 'code':
        execCommand('formatBlock', 'pre')
        break
      case 'clear':
        execCommand('removeFormat')
        execCommand('formatBlock', 'p')
        break
    }
  }, [execCommand])

  const handleEditorChange = useCallback(() => {
    const content = document.getElementById('editor')?.innerHTML || ''
    onChange(content)
  }, [onChange])

  const characterCount = document.getElementById('editor')?.innerText?.length || 0

  // Sanitize HTML to prevent XSS attacks
  const sanitizedValue = useMemo(() => {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
      ALLOW_DATA_ATTR: false,
    })
  }, [value])

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('underline')}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </AdminButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('list')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </AdminButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('alignLeft')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('alignCenter')}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('alignRight')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </AdminButton>
          </div>

          {/* Special Elements */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('quote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('code')}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </AdminButton>
          </div>

          {/* Link */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => {
                handleTextSelection()
                setIsLinkModalOpen(true)
              }}
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </AdminButton>
          </div>

          {/* Clear Formatting */}
          <div className="flex items-center gap-1">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => formatText('clear')}
              title="Clear Formatting"
            >
              <Type className="w-4 h-4" />
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          id="editor"
          contentEditable
          className="p-4 min-h-[200px] focus:outline-none"
          style={{ minHeight: `${height}px` }}
          onInput={handleEditorChange}
          onSelect={handleTextSelection}
          dangerouslySetInnerHTML={{ __html: sanitizedValue }}
          data-placeholder={placeholder}
        />
        {!value && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-right">
        <span className={`text-sm ${characterCount > maxLength ? 'text-red-600' : 'text-gray-500'}`}>
          {characterCount}/{maxLength}
        </span>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10002]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <AdminButton
                variant="outline"
                onClick={() => {
                  setIsLinkModalOpen(false)
                  setLinkUrl('')
                  setLinkText('')
                }}
              >
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={insertLink}>
                Insert Link
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        #editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        
        #editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0;
        }
        
        #editor pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          font-family: monospace;
          margin: 1rem 0;
        }
        
        #editor ul, #editor ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        #editor li {
          margin: 0.5rem 0;
        }
        
        #editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        #editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}
