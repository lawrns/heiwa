'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { Card, CardContent } from './card';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
// import { uploadFile, uploadFiles, validateFile, UploadedFile, UploadProgress } from '@/lib/supabase-storage';

// Temporary types until supabase-storage is implemented
type UploadedFile = {
  url: string;
  name: string;
  size: number;
};

type UploadProgress = {
  progress: number;
  file: File;
  bytesTransferred?: number;
  totalBytes?: number;
};

// Stub functions until supabase-storage is implemented
const validateFile = (file: File) => ({ valid: true, error: '' });
const uploadFiles = async (
  files: File[],
  path: string,
  bucket: string,
  onProgress: (index: number, progress: UploadProgress) => void,
  onFileComplete?: (index: number, result: UploadedFile) => void
): Promise<UploadedFile[]> => {
  // Stub implementation - return empty array
  return [];
};

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
  storagePath: string;
  bucketName?: string;
}

interface UploadedImage extends UploadedFile {
  preview?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  accept = 'image/*',
  disabled = false,
  className = '',
  storagePath,
  bucketName = 'images'
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map(url => ({ url, path: '', name: '', size: 0, type: '' }))
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setUploading(true);
    setUploadProgress({ bytesTransferred: 0, totalBytes: 1, progress: 0, file: files[0] });

    try {
      const uploadedFiles = await uploadFiles(
        files,
        storagePath,
        bucketName,
        (fileIndex, progress) => {
          setUploadProgress(progress);
        },
        (fileIndex, result) => {
          const newImage: UploadedImage = {
            ...result,
            preview: URL.createObjectURL(files[fileIndex])
          };
          setImages(prev => [...prev, newImage]);
        }
      );

      const newUrls = uploadedFiles.map(file => file.url);
      const allUrls = [...value, ...newUrls];
      onChange(allUrls);

      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images.length, maxFiles, storagePath, value, onChange]);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageToRemove = images[index];

    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // Update parent component
    const newUrls = newImages.map(img => img.url);
    onChange(newUrls);

    // Clean up preview URL if it exists
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Note: In a real app, you might want to delete from storage here
    // But for now, we'll keep the files in storage for safety
  }, [images, onChange]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Upload Images</h3>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to select images
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} files, 5MB each
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={disabled || uploading || images.length >= maxFiles}
              className="mt-4"
              data-testid="file-upload"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Images
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && uploadProgress && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress.progress)}%</span>
              </div>
              <Progress value={uploadProgress.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.preview || image.url}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs truncate">{image.name}</p>
                <p className="text-xs opacity-75">
                  {(image.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error states */}
      {images.length === 0 && !uploading && (
        <div className="text-center text-sm text-muted-foreground">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
