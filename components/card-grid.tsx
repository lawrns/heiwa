'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CardGridProps } from '@/lib/types'

export function CardGrid({ items, columns = 3, className, priorityImages = 1 }: CardGridProps & { priorityImages?: number }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div
      className={cn('grid gap-6', gridCols[columns as keyof typeof gridCols], className)}
      role="grid"
      aria-label="Content grid"
    >
      {items.map((item, index) => (
        <motion.article
          key={index}
          className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          role="gridcell"
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden" style={{ position: 'relative' }}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index < priorityImages}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-2xl font-heading font-normal text-text mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>

            {item.description && (
              <p className="text-muted text-sm leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Hover overlay with link */}
          {item.href && (
            <Link
              href={item.href}
              className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              aria-label={`View ${item.title}`}
            >
              <span className="sr-only">View {item.title}</span>
            </Link>
          )}
        </motion.article>
      ))}
    </div>
  )
}
