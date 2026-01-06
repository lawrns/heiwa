/**
 * Image Upload Validation
 * Validates image uploads for security and performance
 */

import { z } from 'zod'

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2MB
  room: 5 * 1024 * 1024, // 5MB
  surfCamp: 5 * 1024 * 1024, // 5MB
  facility: 5 * 1024 * 1024, // 5MB
  general: 10 * 1024 * 1024, // 10MB
} as const

// Image dimensions
export const IMAGE_DIMENSIONS = {
  avatar: { width: 512, height: 512 },
  room: { width: 1920, height: 1080 },
  surfCamp: { width: 1920, height: 1080 },
  facility: { width: 1920, height: 1080 },
} as const

/**
 * Zod schema for image upload validation
 */
export const ImageUploadSchema = z.object({
  file: z.instanceof(File, {
    message: 'Invalid file upload',
  }),
  type: z.enum(ALLOWED_IMAGE_TYPES, {
    message: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF, SVG',
  }),
  size: z.number().max(MAX_FILE_SIZES.general, {
    message: `File size must be less than ${MAX_FILE_SIZES.general / 1024 / 1024}MB`,
  }),
  category: z.enum(['avatar', 'room', 'surfCamp', 'facility', 'general']).default('general'),
})

export type ImageUpload = z.infer<typeof ImageUploadSchema>

/**
 * Validate image file
 */
export async function validateImageFile(
  file: File,
  category: keyof typeof MAX_FILE_SIZES = 'general'
): Promise<{
  valid: boolean
  error?: string
  metadata?: {
    width: number
    height: number
    format: string
    size: number
  }
}> {
  try {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      }
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.general
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      }
    }

    // Check image dimensions
    const dimensions = await getImageDimensions(file)
    if (!dimensions) {
      return {
        valid: false,
        error: 'Failed to read image dimensions',
      }
    }

    // Validate dimensions for specific categories
    if (category === 'avatar') {
      const maxDim = IMAGE_DIMENSIONS.avatar
      if (dimensions.width > maxDim.width || dimensions.height > maxDim.height) {
        return {
          valid: false,
          error: `Avatar must be ${maxDim.width}x${maxDim.height} or smaller`,
        }
      }
    }

    return {
      valid: true,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        format: file.type,
        size: file.size,
      },
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  const sanitized = filename
    .replace(/[\/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim()

  // Add timestamp to prevent conflicts
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  const name = sanitized.replace(`.${ext}`, '')

  return `${name}_${timestamp}.${ext}`
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(
  originalName: string,
  prefix?: string
): string {
  const sanitized = sanitizeFilename(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  if (prefix) {
    return `${prefix}_${timestamp}_${random}_${sanitized}`
  }

  return `${timestamp}_${random}_${sanitized}`
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }

    // Check for common image extensions
    const path = parsed.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

    return imageExtensions.some(ext => path.endsWith(ext))
  } catch {
    return false
  }
}

/**
 * Optimize image (client-side)
 * Returns a promise that resolves to an optimized File
 */
export async function optimizeImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'image/jpeg' | 'image/png' | 'image/webp'
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate dimensions
      let { width, height } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'))
            return
          }

          const optimizedFile = new File([blob], file.name, {
            type: format,
            lastModified: Date.now(),
          })

          resolve(optimizedFile)
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Calculate dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const widthRatio = maxWidth / originalWidth
  const heightRatio = maxHeight / originalHeight
  const ratio = Math.min(widthRatio, heightRatio, 1)

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  }
}

/**
 * Validate multiple images
 */
export async function validateMultipleImages(
  files: File[],
  category: keyof typeof MAX_FILE_SIZES = 'general'
): Promise<{
  valid: boolean
  errors: string[]
  validFiles: File[]
  metadata: Array<{ width: number; height: number; format: string; size: number }>
}> {
  const errors: string[] = []
  const validFiles: File[] = []
  const metadata: Array<{ width: number; height: number; format: string; size: number }> = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await validateImageFile(file, category)

    if (result.valid) {
      validFiles.push(file)
      if (result.metadata) {
        metadata.push(result.metadata)
      }
    } else {
      errors.push(`File ${i + 1}: ${result.error}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
    metadata,
  }
}
