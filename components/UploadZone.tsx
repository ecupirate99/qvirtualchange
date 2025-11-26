import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { FileData } from '../types';
import { processFile } from '../utils';

interface UploadZoneProps {
  label: string;
  fileData: FileData | null;
  onFileSelect: (data: FileData | null) => void;
  accept?: string;
  id: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({ 
  label, 
  fileData, 
  onFileSelect, 
  accept = "image/*",
  id
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const processed = await processFile(e.dataTransfer.files[0]);
      onFileSelect(processed);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const processed = await processFile(e.target.files[0]);
      onFileSelect(processed);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
          {label}
        </label>
      </div>
      
      <div
        onClick={() => !fileData && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 h-64 sm:h-80 flex flex-col items-center justify-center
          ${isDragging 
            ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-100 dark:bg-gray-900/50'
          }
          ${fileData ? 'border-none p-0' : 'p-6'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          className="hidden"
          accept={accept}
          onChange={handleInputChange}
        />

        {fileData ? (
          <>
            <img 
              src={fileData.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-transform hover:scale-110 shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-xs text-white truncate text-center">{fileData.file.name}</p>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className={`p-4 rounded-full transition-colors ${
              isDragging 
                ? 'bg-accent-100 text-accent-600 dark:bg-gray-800 dark:text-accent-400' 
                : 'bg-white text-gray-400 shadow-sm dark:bg-gray-800 dark:text-gray-400 dark:shadow-none'
              }`}
            >
              <Upload size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;