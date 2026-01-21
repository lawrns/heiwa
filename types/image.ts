export interface CarouselImage {
  id: string
  url: string
  alt_text: string
  caption?: string
  order: number
  created_at: string
  updated_at?: string
  width?: number
  height?: number
  file_size?: number
  format?: string
}

export interface ImageMetadata {
  filename: string
  url: string
  alt_text: string
  caption?: string
  width: number
  height: number
  file_size: number
  format: string
  created_at: string
  updated_at?: string
  tags?: string[]
  section_id?: string
  order?: number
}

export interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  width?: number
  height?: number
  crop?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9' | 'free'
}

export interface ResponsiveImageVariants {
  desktop?: string
  tablet?: string
  mobile?: string
}
