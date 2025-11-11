'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Heading2, Heading3, Heading4, Type } from 'lucide-react'

interface TipTapEditorProps {
  content: any
  onChange: (content: any) => void
  placeholder?: string
}

export function TipTapEditor({ content, onChange, placeholder = 'Start writing...' }: TipTapEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const headingMenuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable Link extension from StarterKit since we're adding our own configured version
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || {
      type: 'doc',
      content: [],
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // Close heading menu when clicking outside - MUST be before early return
  useEffect(() => {
    if (!editor) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
        setHeadingMenuOpen(false)
      }
    }

    if (headingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [headingMenuOpen, editor])

  if (!editor) {
    return null
  }

  const addImage = async () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('File must be an image')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'blog-images')
    formData.append('path', 'content')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Prompt for alt text
        const altText = window.prompt('Enter image alt text (optional):') || ''
        editor.chain().focus().setImage({ src: data.data.url, alt: altText }).run()
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      alert('Error uploading image')
      console.error(error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getHeadingLevel = () => {
    if (editor.isActive('heading', { level: 2 })) return 2
    if (editor.isActive('heading', { level: 3 })) return 3
    if (editor.isActive('heading', { level: 4 })) return 4
    return 0
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50 flex-wrap">
        {/* Heading Dropdown */}
        <div className="relative" ref={headingMenuRef}>
          <button
            type="button"
            onClick={() => setHeadingMenuOpen(!headingMenuOpen)}
            className={`p-2 rounded hover:bg-gray-200 ${
              getHeadingLevel() > 0 ? 'bg-gray-300' : ''
            }`}
            title="Headings"
          >
            <Type className="h-4 w-4" />
          </button>
          {headingMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setParagraph().run()
                  setHeadingMenuOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg ${
                  getHeadingLevel() === 0 ? 'bg-gray-200' : ''
                }`}
              >
                Paragraph
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                  setHeadingMenuOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  getHeadingLevel() === 2 ? 'bg-gray-200' : ''
                }`}
              >
                <Heading2 className="h-4 w-4" />
                Heading 2
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                  setHeadingMenuOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  getHeadingLevel() === 3 ? 'bg-gray-200' : ''
                }`}
              >
                <Heading3 className="h-4 w-4" />
                Heading 3
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                  setHeadingMenuOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 rounded-b-lg ${
                  getHeadingLevel() === 4 ? 'bg-gray-200' : ''
                }`}
              >
                <Heading4 className="h-4 w-4" />
                Heading 4
              </button>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-gray-300' : ''
          }`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          disabled={uploading}
          className={`p-2 rounded hover:bg-gray-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={uploading ? 'Uploading...' : 'Add Image'}
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
          className="hidden"
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

