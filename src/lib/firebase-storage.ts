import { supabase } from './firebase';

// Storage buckets (Supabase)
export const STORAGE_BUCKETS = {
  ROOMS: 'rooms',
  SURF_CAMPS: 'surf-camps',
  ADD_ONS: 'add-ons',
  TEMP: 'temp'
} as const;

// Backward compatibility
export const STORAGE_PATHS = STORAGE_BUCKETS;

// File validation
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10
} as const;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadedFile {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

/**
 * Upload single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = fileName;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload failed:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: data.path,
      name: fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  bucket: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, result: UploadedFile) => void
): Promise<UploadedFile[]> {
  if (files.length > FILE_CONSTRAINTS.MAX_FILES) {
    throw new Error(`Maximum ${FILE_CONSTRAINTS.MAX_FILES} files allowed`);
  }

  const results: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadFile(files[i], bucket, (progress) => {
        onProgress?.(i, progress);
      });
      results.push(result);
      onFileComplete?.(i, result);
    } catch (error) {
      console.error(`Failed to upload file ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete failed:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error('Delete multiple files failed:', error);
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete multiple files failed:', error);
    throw new Error('Failed to delete files');
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(bucket: string, path: string): Promise<any> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      });

    if (error) {
      console.error('Get metadata failed:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }

    return data?.[0] || { path };
  } catch (error) {
    console.error('Get metadata failed:', error);
    throw new Error('Failed to get file metadata');
  }
}

/**
 * Generate optimized image URLs (Supabase handles this automatically)
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  // Supabase automatically optimizes images
  // You can add transformation parameters if needed
  return url;
}

/**
 * Storage utilities for specific use cases
 */
export const storageUtils = {
  // Room images
  uploadRoomImage: (file: File, roomId?: string) =>
    uploadFile(file, STORAGE_BUCKETS.ROOMS),

  uploadRoomImages: (files: File[], roomId?: string) =>
    uploadFiles(files, STORAGE_BUCKETS.ROOMS),

  // Surf camp images
  uploadSurfCampImage: (file: File, campId?: string) =>
    uploadFile(file, STORAGE_BUCKETS.SURF_CAMPS),

  uploadSurfCampImages: (files: File[], campId?: string) =>
    uploadFiles(files, STORAGE_BUCKETS.SURF_CAMPS),

  // Add-on images
  uploadAddOnImage: (file: File, addOnId?: string) =>
    uploadFile(file, STORAGE_BUCKETS.ADD_ONS),

  uploadAddOnImages: (files: File[], addOnId?: string) =>
    uploadFiles(files, STORAGE_BUCKETS.ADD_ONS),

  // Delete utilities
  deleteRoomImages: (paths: string[]) => deleteFiles(STORAGE_BUCKETS.ROOMS, paths),
  deleteSurfCampImages: (paths: string[]) => deleteFiles(STORAGE_BUCKETS.SURF_CAMPS, paths),
  deleteAddOnImages: (paths: string[]) => deleteFiles(STORAGE_BUCKETS.ADD_ONS, paths),
};
