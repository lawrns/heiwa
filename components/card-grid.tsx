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
          className="group relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          role="gridcell"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index < priorityImages}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl sm:text-3xl font-heading font-light text-white mb-1">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-white/80 text-sm">
                  {item.description}
                </p>
              )}
            </div>
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
