// src/components/common/SingleImageUpload.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { uploadApi } from '@/lib/api';

interface SingleImageUploadProps {
  image: string;
  onChange: (image: string) => void;
}

export default function SingleImageUpload({ image, onChange }: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>(image);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local preview when image prop changes
  useEffect(() => {
    console.log('SingleImageUpload - image prop changed:', image);
    setLocalPreview(image);
  }, [image]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    console.log('Local preview created:', previewUrl);

    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(file);
      console.log('Upload API full response:', response);
      
      // Handle the response structure from your API
      // Your API returns: { data: { url: string, fileId: string }, success: true, message: string }
      const imageUrl = response.data?.data?.url || response.data?.url || response.url;
      
      if (imageUrl) {
        console.log('Image uploaded successfully, URL:', imageUrl);
        setLocalPreview(imageUrl);
        onChange(imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        console.error('No URL in response:', response);
        throw new Error('No image URL returned from server');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      // Revert to original image on error
      setLocalPreview(image);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      // Clean up local preview URL after upload completes or fails
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  }, [onChange, image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = () => {
    console.log('Removing image');
    setLocalPreview('');
    onChange('');
  };

  return (
    <div className="space-y-4">
      {localPreview ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-video relative">
            <Image
              src={localPreview}
              alt="Featured"
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Image failed to load:', localPreview);
                // If it's a blob URL that failed, try to show a fallback
                if (localPreview.startsWith('blob:')) {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                    fallback.innerHTML = '<p class="text-gray-400 text-sm">Preview unavailable</p>';
                    parent.appendChild(fallback);
                  }
                }
              }}
              onLoad={() => console.log('Image loaded successfully:', localPreview)}
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 text-sm rounded-lg hover:bg-gray-100 flex items-center gap-1"
              title="Change image"
            >
              <FiUpload className="h-4 w-4" />
              Change
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 flex items-center gap-1"
              title="Remove"
            >
              <FiX className="h-4 w-4" />
              Remove
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-gray-200 opacity-50 pointer-events-none'
              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-3 border-primary-500 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FiImage className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload featured image
              </p>
              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}