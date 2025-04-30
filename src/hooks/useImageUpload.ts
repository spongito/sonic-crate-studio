
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ImageUploadOptions {
  maxSizeMB?: number;
  bucket?: string;
  requiredAspectRatio?: 'square';
}

interface UploadMetadata {
  fileType: string;
  sizeBytes: number;
  width: number;
  height: number;
  fileName: string;
}

export const useImageUpload = (options: ImageUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  
  const {
    maxSizeMB = 8,
    bucket = 'playlist_covers',
    requiredAspectRatio
  } = options;
  
  const validateImage = async (file: File): Promise<{valid: boolean, metadata?: UploadMetadata}> => {
    // Check file size (MB)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return { valid: false };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or GIF files are allowed');
      return { valid: false };
    }
    
    // Check dimensions and aspect ratio
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        if (requiredAspectRatio === 'square' && width !== height) {
          toast.error('Image must be square (width equals height)');
          resolve({ valid: false });
        } else {
          resolve({ 
            valid: true,
            metadata: {
              fileType: file.type,
              sizeBytes: file.size,
              width,
              height,
              fileName: file.name,
            }
          });
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        toast.error('Invalid image file');
        resolve({ valid: false });
      };
      img.src = URL.createObjectURL(file);
    });
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Validate image
      const validation = await validateImage(file);
      if (!validation.valid) {
        return null;
      }
      
      const metadata = validation.metadata!;
      
      // Create a unique filename with timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      // Store metadata if needed
      // This could be expanded to store metadata in a database table
      
      setProgress(100);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    uploadImage,
    isUploading,
    progress,
    validateImage
  };
};
