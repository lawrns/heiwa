import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string = 'images',
  path?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename if not provided
    const filename = path || `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return {
        url: '',
        path: '',
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  path: string,
  bucket: string = 'images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(path: string, bucket: string = 'images'): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * List images in a bucket
 */
export async function listImages(
  bucket: string = 'images',
  path?: string
): Promise<{ path: string; name: string }[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)

    if (error) {
      console.error('Failed to list images:', error)
      return []
    }

    return data.map(item => ({
      path: `${path ? path + '/' : ''}${item.name}`,
      name: item.name
    }))
  } catch (error) {
    console.error('Failed to list images:', error)
    return []
  }
}
