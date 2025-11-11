'use client'

import { useMemo } from 'react'
import React from 'react'
import Image from 'next/image'

interface TipTapRendererProps {
  content: any
  className?: string
}

export function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content || !content.content) {
      return <p className="text-gray-500 italic">No content</p>
    }

    const renderNode = (node: any, key?: number | string): React.ReactNode => {
      if (!node) return null

      switch (node.type) {
        case 'paragraph':
          return (
            <p className="mb-4 text-gray-700 leading-relaxed">
              {node.content?.map((child: any, idx: number) => (
                <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
              ))}
            </p>
          )

        case 'heading':
          const level = node.attrs?.level || 1
          const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
          const headingClasses = {
            1: 'text-4xl font-bold mb-6 mt-8',
            2: 'text-3xl font-bold mb-4 mt-6',
            3: 'text-2xl font-bold mb-3 mt-4',
          }[level] || 'text-xl font-bold mb-2 mt-3'
          
          return (
            <HeadingTag className={headingClasses}>
              {node.content?.map((child: any, idx: number) => (
                <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
              ))}
            </HeadingTag>
          )

        case 'bulletList':
          return (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              {node.content?.map((child: any, idx: number) => renderNode(child, idx))}
            </ul>
          )

        case 'orderedList':
          return (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
              {node.content?.map((child: any, idx: number) => renderNode(child, idx))}
            </ol>
          )

        case 'listItem':
          const listItemProps: any = { className: 'mb-1' }
          if (key !== undefined) {
            listItemProps.key = key
          }
          return (
            <li {...listItemProps}>
              {node.content?.map((child: any, idx: number) => renderNode(child))}
            </li>
          )

        case 'image':
          const src = node.attrs?.src || ''
          const alt = node.attrs?.alt || ''
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
          let text = node.text || ''
          
          // Apply marks
          if (node.marks) {
            node.marks.forEach((mark: any) => {
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
            return node.content.map((child: any, idx: number) => (
              <span key={idx}>{renderNode(child)}</span>
            ))
          }
          return null
      }
    }

    return content.content.map((node: any, idx: number) => (
      <div key={idx}>{renderNode(node)}</div>
    ))
  }, [content])

  return <div className={`prose prose-lg max-w-none ${className}`}>{renderedContent}</div>
}

