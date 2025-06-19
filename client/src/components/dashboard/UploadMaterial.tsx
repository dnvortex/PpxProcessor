import React, { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadMaterialProps {
  onUploadSuccess: () => void;
  onUploadStart: () => void;
}

const UploadMaterial: React.FC<UploadMaterialProps> = ({ onUploadSuccess, onUploadStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id.toString());
    formData.append('title', file.name);

    try {
      onUploadStart();
      
      const response = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and processed`,
      });
      
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload New Material</h3>
      </div>
      <div className="p-6">
        <div 
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
            isDragging 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-700 border-dashed'
          } rounded-lg`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 focus-within:outline-none">
                <span>Upload a file</span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.ppt,.pptx,.ppx"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PDF, DOCX, TXT, PPX, JPG, PNG up to 10MB
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button 
            type="button" 
            onClick={handleButtonClick}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="material-icons text-sm mr-2">upload_file</span>
            Upload & Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadMaterial;
