
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size (MB)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or GIF files are allowed');
      return false;
    }
    
    // Check if image is square
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          toast.error('Image must be square (width equals height)');
          resolve(false);
        } else {
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        toast.error('Invalid image file');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // First validate the image
      const isValid = await validateImage(file);
      if (!isValid) return;
      
      // Show preview immediately after validation
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Start uploading to Supabase
      setIsUploading(true);
      
      // Use useImageUpload hook here
      const uploadedUrl = await uploadImageToSupabase(file, bucketName);
      
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
      setIsUploading(false);
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

// Helper function to upload image to Supabase
async function uploadImageToSupabase(file: File, bucketName: string): Promise<string> {
  const { supabase } = await import('@/integrations/supabase/client');
  const { user } = (await import('@/context/AuthContext')).useAuth();
  
  if (!user) {
    throw new Error('User must be authenticated to upload files');
  }
  
  // Create a unique filename with timestamp
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;
  
  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });
  
  if (error) throw error;
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return publicUrlData.publicUrl;
}
