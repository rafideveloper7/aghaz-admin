'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { uploadApi } from '@/lib/api';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const results: string[] = [...images];
      
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
          continue;
        }

        const response = await uploadApi.uploadImage(file);
        if (response.data.success) {
          results.push(response.data.data.url);
        }
      }

      onChange(results);
      toast.success(`${fileArray.length} image(s) uploaded successfully`);
    } catch (error: unknown) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-3 border-primary-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiUpload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drop images here or <span className="text-primary-600">browse</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-square relative">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); moveImage(index, 'left'); }}
                    className="p-1 bg-white rounded-full hover:bg-gray-100"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeImage(index); }}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); moveImage(index, 'right'); }}
                    className="p-1 bg-white rounded-full hover:bg-gray-100"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-medium rounded-full">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
