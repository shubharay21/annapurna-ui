"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { CloudUpload, File as FileIcon, Trash2 } from 'lucide-react';

export interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export default function FileUpload({
  id,
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 2,
  value = null,
  onChange,
  error,
  helperText,
  required = false
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const processFile = (file: File | undefined | null) => {
    if (!file) return;

    // Check size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    if (onChange) {
      onChange(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input click
    if (onChange) {
      onChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-on-surface flex items-center gap-1">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div
        onClick={!value ? triggerFileInput : undefined}
        onDragOver={!value ? handleDragOver : undefined}
        onDragLeave={!value ? handleDragLeave : undefined}
        onDrop={!value ? handleDrop : undefined}
        className={`
          relative w-full rounded-lg transition-colors
          ${!value ? 'cursor-pointer border-2 border-dashed p-6 flex flex-col items-center justify-center text-center min-h-[140px]' : 'border border-outline-variant bg-surface-container-lowest p-3 flex items-center justify-between'}
          ${isDragActive && !value ? 'border-primary bg-primary/5' : ''}
          ${!isDragActive && !value && !error ? 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low' : ''}
          ${error ? 'border-error bg-error-container/20' : ''}
        `}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {!value ? (
          // Empty State
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
              <CloudUpload size={24} strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-on-surface">
              Click or drag to upload
            </p>
            <p className="text-xs text-on-surface-variant">
              {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} (Max {maxSizeMB}MB)
            </p>
          </div>
        ) : (
          // Filled State
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 w-10 h-10 rounded bg-surface-container flex items-center justify-center text-on-surface-variant">
                <FileIcon size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-on-surface truncate">
                  {value.name}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {formatFileSize(value.size)} &bull; Uploaded
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleRemoveFile}
              className="shrink-0 p-2 text-error hover:bg-error-container/30 rounded-md transition-colors"
              aria-label="Remove file"
            >
              <Trash2 size={18} strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {/* Helper text or error message */}
      {(error || helperText) && (
        <div className={`text-xs mt-1 flex items-start gap-1 ${error ? 'text-error' : 'text-on-surface-variant'}`}>
          {error && <span className="material-symbols-outlined text-[14px]">error</span>}
          {!error && helperText && <span className="material-symbols-outlined text-[14px]">info</span>}
          <span>{error || helperText}</span>
        </div>
      )}
    </div>
  );
}
