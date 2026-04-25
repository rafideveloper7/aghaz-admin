'use client';

import { useState, useRef, useCallback } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(file);
      if (response.data?.url) {
        onChange(response.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

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
    onChange('');
  };

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-video relative">
            <Image
              src={image}
              alt="Featured"
              fill
              className="object-cover"
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
