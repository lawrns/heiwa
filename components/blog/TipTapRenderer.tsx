'use client'

import { useMemo } from 'react'
import React from 'react'
import Image from 'next/image'

interface TipTapMark {
  type: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link'
  attrs?: {
    href?: string
    target?: string
    rel?: string
  }
}

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}

export interface TipTapDocument {
  type: 'doc'
  content: TipTapNode[]
}

interface TipTapRendererProps {
  content: TipTapDocument | null | undefined
  className?: string
}

export function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content || !content.content) {
      return <p className="text-gray-500 italic">No content available</p>
    }

    const renderTextWithMarks = (node: TipTapNode, idx: number): React.ReactNode => {
      let text: React.ReactNode = node.text || ''
      
      if (!node.marks || node.marks.length === 0) {
        return <React.Fragment key={idx}>{text}</React.Fragment>
      }

      // Apply marks in order
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            text = <strong>{text}</strong>
            break
          case 'italic':
            text = <em>{text}</em>
            break
          case 'underline':
            text = <u>{text}</u>
            break
          case 'strike':
            text = <s>{text}</s>
            break
          case 'code':
            text = <code>{text}</code>
            break
          case 'link':
            text = (
              <a
                href={mark.attrs?.href}
                target={mark.attrs?.target || '_blank'}
                rel="noopener noreferrer"
              >
                {text}
              </a>
            )
            break
        }
      }
      
      return <React.Fragment key={idx}>{text}</React.Fragment>
    }

    const renderChildren = (nodes?: TipTapNode[]): React.ReactNode => {
      if (!nodes) return null
      return nodes.map((child, idx) => renderNode(child, idx))
    }

    const renderNode = (node: TipTapNode, key: number): React.ReactNode => {
      if (!node) return null

      switch (node.type) {
        case 'text':
          return renderTextWithMarks(node, key)

        case 'paragraph':
          // Empty paragraph = line break
          if (!node.content || node.content.length === 0) {
            return <p key={key}><br /></p>
          }
          return <p key={key}>{renderChildren(node.content)}</p>

        case 'heading': {
          const level = (node.attrs?.level as number) || 2
          const clampedLevel = Math.min(Math.max(level, 1), 6)
          switch (clampedLevel) {
            case 1: return <h1 key={key}>{renderChildren(node.content)}</h1>
            case 2: return <h2 key={key}>{renderChildren(node.content)}</h2>
            case 3: return <h3 key={key}>{renderChildren(node.content)}</h3>
            case 4: return <h4 key={key}>{renderChildren(node.content)}</h4>
            case 5: return <h5 key={key}>{renderChildren(node.content)}</h5>
            case 6: return <h6 key={key}>{renderChildren(node.content)}</h6>
            default: return <h2 key={key}>{renderChildren(node.content)}</h2>
          }
        }

        case 'bulletList':
          return <ul key={key}>{renderChildren(node.content)}</ul>

        case 'orderedList':
          return <ol key={key}>{renderChildren(node.content)}</ol>

        case 'listItem':
          return <li key={key}>{renderChildren(node.content)}</li>

        case 'blockquote':
          return <blockquote key={key}>{renderChildren(node.content)}</blockquote>

        case 'codeBlock':
          return (
            <pre key={key}>
              <code>{node.content?.map(c => c.text).join('') || ''}</code>
            </pre>
          )

        case 'horizontalRule':
          return <hr key={key} />

        case 'image': {
          const src = (node.attrs?.src as string) || ''
          const alt = (node.attrs?.alt as string) || ''
          const title = (node.attrs?.title as string) || ''
          if (!src) return null
          return (
            <figure key={key} className="my-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={alt || 'Blog image'}
                  fill
                  className="object-cover"
                  unoptimized={src.includes('unsplash.com') || src.includes('supabase')}
                />
              </div>
              {title && <figcaption className="text-center mt-2 text-sm text-gray-500">{title}</figcaption>}
            </figure>
          )
        }

        case 'hardBreak':
          return <br key={key} />

        case 'table':
          return (
            <div key={key} className="overflow-x-auto my-6">
              <table>{renderChildren(node.content)}</table>
            </div>
          )

        case 'tableRow':
          return <tr key={key}>{renderChildren(node.content)}</tr>

        case 'tableHeader':
          return <th key={key}>{renderChildren(node.content)}</th>

        case 'tableCell':
          return <td key={key}>{renderChildren(node.content)}</td>

        default:
          // For unknown types, try to render children
          if (node.content) {
            return <div key={key}>{renderChildren(node.content)}</div>
          }
          return null
      }
    }

    return content.content.map((node, idx) => renderNode(node, idx))
  }, [content])

  return (
    <div 
      className={`
        prose prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:my-4 prose-ol:my-4
        prose-li:text-gray-700 prose-li:my-1
        prose-blockquote:border-l-orange-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:italic
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-md
        prose-hr:border-gray-200 prose-hr:my-8
        break-words
        ${className}
      `}
    >
      {renderedContent}
    </div>
  )
}

