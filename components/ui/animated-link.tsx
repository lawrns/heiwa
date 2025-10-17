'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import React from 'react'

interface AnimatedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}

export function AnimatedLink({
  href,
  children,
  className = '',
  external = false,
}: AnimatedLinkProps) {
  return (
    <Link
      href={href}
      className={`relative inline-block group ${className}`}
      {...(external && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
    >
      {children}
      <motion.span
        className="absolute left-0 bottom-0 h-0.5 bg-accent"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </Link>
  )
}
