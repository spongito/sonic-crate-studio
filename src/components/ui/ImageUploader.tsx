
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  bucketName?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  maxSizeMB = 8,
  bucketName = 'playlist_covers'
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the existing useImageUpload hook
  const { uploadImage, isUploading, validateImage } = useImageUpload({
    maxSizeMB,
    bucket: bucketName,
    requiredAspectRatio: 'square'
  });

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // First validate the image using the hook's validate function
      const validation = await validateImage(file);
      if (!validation.valid) return;
      
      // Show preview immediately after validation
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Use the hook's upload function
      const uploadedUrl = await uploadImage(file);
      
      if (!uploadedUrl) {
        toast.error('Failed to upload image');
        // Reset preview if upload fails
        if (!currentImageUrl) {
          setPreviewImage(null);
        } else {
          setPreviewImage(currentImageUrl);
        }
        return;
      }
      
      // Call the callback with the uploaded URL
      onImageUploaded(uploadedUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Reset preview if upload fails
      if (!currentImageUrl) {
        setPreviewImage(null);
      } else {
        setPreviewImage(currentImageUrl);
      }
    } finally {
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageUploaded('');
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Image Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-10 w-10 mb-2" />
            <span className="text-xs text-center">No image</span>
          </div>
        )}
        {previewImage && (
          <button 
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleUploadClick}
          disabled={isUploading}
          type="button"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG or GIF. Square aspect ratio.<br />Max {maxSizeMB}MB.
        </p>
      </div>
    </div>
  );
};
