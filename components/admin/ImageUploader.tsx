'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, ImagePlus } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, maxFiles = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleUpload = async (file: File) => {
    if (images.length >= maxFiles) {
      showToast(`You can only upload up to ${maxFiles} images`, 'error');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} exceeds 5MB size limit`, 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange([...images, data.url]);
      } else {
        showToast(data.message || 'Failed to upload image', 'error');
      }
    } catch (e) {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Support uploading sequentially
      for (const file of files) {
        await handleUpload(file);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      // Accept only images
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        showToast('Only image files are allowed', 'error');
        return;
      }
      for (const file of imageFiles) {
        await handleUpload(file);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-agro-green bg-agro-green/5'
            : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900'
        } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-agro-green animate-spin" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-agro-green/10 flex items-center justify-center text-agro-green">
              <UploadCloud className="h-7 w-7" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {isUploading ? 'Uploading...' : 'Click or drag images here to upload'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports JPEG, PNG, WEBP (Max {maxFiles} images, 5MB each)
            </p>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                 <span>Image {idx + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < maxFiles && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 hover:text-agro-green hover:border-agro-green transition-colors cursor-pointer"
            >
              <ImagePlus className="h-6 w-6 mb-2" />
              <span className="text-[10px] font-medium uppercase">Add More</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
