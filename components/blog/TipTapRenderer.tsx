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

interface TipTapTextNode {
  type: 'text'
  text: string
  marks?: TipTapMark[]
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
      return <p className="text-gray-500 italic">No content</p>
    }

    const renderNode = (node: TipTapNode, key?: number | string): React.ReactNode => {
      if (!node) return null

      switch (node.type) {
        case 'paragraph':
          return (
            <p className="mb-4 text-gray-700 leading-relaxed">
              {node.content?.map((child: TipTapNode, idx: number) => (
                <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
              ))}
            </p>
          )

        case 'heading':
          const level = (node.attrs?.level as number) || 1
          const headingClasses: Record<number, string> = {
            1: 'text-4xl font-bold mb-6 mt-8',
            2: 'text-3xl font-bold mb-4 mt-6',
            3: 'text-2xl font-bold mb-3 mt-4',
          }
          const className = headingClasses[level] || 'text-xl font-bold mb-2 mt-3'
          
          if (level === 1) {
            return (
              <h1 className={className}>
                {node.content?.map((child: TipTapNode, idx: number) => (
                  <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
                ))}
              </h1>
            )
          } else if (level === 2) {
            return (
              <h2 className={className}>
                {node.content?.map((child: TipTapNode, idx: number) => (
                  <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
                ))}
              </h2>
            )
          } else if (level === 3) {
            return (
              <h3 className={className}>
                {node.content?.map((child: TipTapNode, idx: number) => (
                  <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
                ))}
              </h3>
            )
          }
          return null

        case 'bulletList':
          return (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              {node.content?.map((child: TipTapNode, idx: number) => renderNode(child, idx))}
            </ul>
          )

        case 'orderedList':
          return (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
              {node.content?.map((child: TipTapNode, idx: number) => renderNode(child, idx))}
            </ol>
          )

        case 'listItem':
          return (
            <li className="mb-1" key={String(key)}>
              {node.content?.map((child: TipTapNode, idx: number) => renderNode(child))}
            </li>
          )

        case 'image':
          const src = (node.attrs?.src as string) || ''
          const alt = (node.attrs?.alt as string) || ''
          return (
            <div className="my-6">
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )

        case 'hardBreak':
          return <br />

        case 'text':
          let text: React.ReactNode = node.text || ''
          
          // Apply marks
          if (node.marks) {
            node.marks.forEach((mark: TipTapMark) => {
              switch (mark.type) {
                case 'bold':
                  text = <strong key={Math.random()}>{text}</strong>
                  break
                case 'italic':
                  text = <em key={Math.random()}>{text}</em>
                  break
                case 'link':
                  return (
                    <a
                      key={Math.random()}
                      href={mark.attrs?.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline hover:text-orange-700"
                    >
                      {text}
                    </a>
                  )
              }
            })
          }
          
          return text

        default:
          // Recursively render children
          if (node.content) {
            return node.content.map((child: TipTapNode, idx: number) => (
              <span key={idx}>{renderNode(child)}</span>
            ))
          }
          return null
      }
    }

    return content.content.map((node: TipTapNode, idx: number) => (
      <div key={idx}>{renderNode(node)}</div>
    ))
  }, [content])

  return <div className={`prose prose-lg max-w-none ${className}`}>{renderedContent}</div>
}

