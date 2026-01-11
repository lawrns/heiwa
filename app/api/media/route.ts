import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const UPLOAD_BUCKET = 'media-library'

// All buckets to aggregate images from
const ALL_BUCKETS = [
  'media-library',
  'cms-media',
  'page-images',
  'surf-camp-images',
  'room-images',
  'blog-images',
  'add-on-images',
  'cms-images'
]

interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  metadata?: {
    size?: number
    mimetype?: string
  }
}

interface MediaFile extends StorageFile {
  fullPath: string
  bucket: string
}

interface TransformedMediaItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  created_at: string
  bucket: string
  folder: string | undefined
}

// Recursively list all files in a bucket (including subfolders)
async function listAllFiles(bucket: string, path: string = ''): Promise<MediaFile[]> {
  const { data: items, error } = await supabaseAdmin
    .storage
    .from(bucket)
    .list(path, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error || !items) return []

  const files: MediaFile[] = []
  
  for (const item of items) {
    // Skip placeholder files
    if (item.name === '.emptyFolderPlaceholder') continue
    
    const fullPath = path ? `${path}/${item.name}` : item.name
    
    // If it's a folder (no metadata), recurse into it
    if (!item.metadata) {
      const subFiles = await listAllFiles(bucket, fullPath)
      files.push(...subFiles)
    } else {
      // It's a file
      files.push({
        ...item,
        fullPath,
        bucket
      })
    }
  }
  
  return files
}

// GET /api/media - List all media files from ALL buckets
export async function GET() {
  try {
    const allMediaItems: TransformedMediaItem[] = []

    // Fetch from all buckets in parallel
    const bucketPromises = ALL_BUCKETS.map(async (bucket) => {
      try {
        const files = await listAllFiles(bucket)
        
        return files.map(file => {
          const { data: urlData } = supabaseAdmin
            .storage
            .from(bucket)
            .getPublicUrl(file.fullPath)

          return {
            id: `${bucket}/${file.fullPath}`,
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'image/unknown',
            created_at: file.created_at || new Date().toISOString(),
            bucket: bucket,
            folder: file.fullPath.includes('/') ? file.fullPath.split('/').slice(0, -1).join('/') : undefined
          }
        })
      } catch (err) {
        console.error(`Error listing bucket ${bucket}:`, err)
        return []
      }
    })

    const results = await Promise.all(bucketPromises)
    results.forEach(items => allMediaItems.push(...items))

    // Sort by created_at descending
    allMediaItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: allMediaItems,
      stats: {
        total: allMediaItems.length,
        buckets: ALL_BUCKETS.length
      }
    })
  } catch (error) {
    console.error('Error in media GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${sanitizedName}`

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin
        .storage
        .from(UPLOAD_BUCKET)
        .upload(filename, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin
        .storage
        .from(UPLOAD_BUCKET)
        .getPublicUrl(filename)

      uploadedFiles.push({
        id: filename,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        created_at: new Date().toISOString()
      })
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload files' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
  } catch (error) {
    console.error('Error in media POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
