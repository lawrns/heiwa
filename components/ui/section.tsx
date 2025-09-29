import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  background?: 'white' | 'alt'
  maxWidth?: 'container' | 'content'
  paddingY?: 'normal' | 'large'
}

export function Section({
  children,
  className = '',
  containerClassName = '',
  background = 'white',
  maxWidth = 'container',
  paddingY = 'normal',
}: SectionProps) {
  const bgClasses = {
    white: 'bg-white',
    alt: 'bg-surface-alt',
  }

  const paddingClasses = {
    normal: 'py-section-y',
    large: 'py-section-y-lg',
  }

  const maxWidthClasses = {
    container: 'max-w-container',
    content: 'max-w-content',
  }

  return (
    <section className={`${bgClasses[background]} ${paddingClasses[paddingY]} ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  )
}
