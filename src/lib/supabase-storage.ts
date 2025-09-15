// Supabase Storage utilities for file uploads
import { supabase } from './supabase/client';

export interface UploadedFile {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' };
  }

  // Check specific image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

// Upload single file
export async function uploadFile(
  file: File,
  storagePath: string,
  bucketName: string = 'images',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${storagePath}/${fileName}`;

  // Simulate progress for now (Supabase doesn't provide upload progress)
  if (onProgress) {
    onProgress({ bytesTransferred: 0, totalBytes: file.size, progress: 0 });
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (onProgress) {
    onProgress({ bytesTransferred: file.size, totalBytes: file.size, progress: 100 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

// Upload multiple files
export async function uploadFiles(
  files: File[],
  storagePath: string,
  bucketName: string = 'images',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, result: UploadedFile) => void
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const result = await uploadFile(
        file,
        storagePath,
        bucketName,
        onProgress ? (progress) => onProgress(i, progress) : undefined
      );

      results.push(result);

      if (onFileComplete) {
        onFileComplete(i, result);
      }
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw error;
    }
  }

  return results;
}

// Delete file
export async function deleteFile(filePath: string, bucketName: string = 'images'): Promise<void> {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// Delete multiple files
export async function deleteFiles(filePaths: string[], bucketName: string = 'images'): Promise<void> {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove(filePaths);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// Storage utilities for different entity types
export const storageUtils = {
  // Room images
  async uploadRoomImages(files: File[], roomId: string): Promise<UploadedFile[]> {
    return uploadFiles(files, `${roomId}`, 'rooms');
  },

  async deleteRoomImages(filePaths: string[]): Promise<void> {
    return deleteFiles(filePaths, 'rooms');
  },

  // Surf camp images
  async uploadSurfCampImages(files: File[], campId: string): Promise<UploadedFile[]> {
    return uploadFiles(files, `${campId}`, 'surf-camps');
  },

  async deleteSurfCampImages(filePaths: string[]): Promise<void> {
    return deleteFiles(filePaths, 'surf-camps');
  },

  // Add-on images
  async uploadAddOnImages(files: File[], addOnId: string): Promise<UploadedFile[]> {
    return uploadFiles(files, `${addOnId}`, 'add-ons');
  },

  async deleteAddOnImages(filePaths: string[]): Promise<void> {
    return deleteFiles(filePaths, 'add-ons');
  },
};
