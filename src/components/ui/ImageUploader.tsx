
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  bucketName?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  maxSizeMB = 8,
  bucketName = 'playlist_covers',
  className,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(currentImageUrl || null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the existing useImageUpload hook
  const { uploadImage, isUploading, validateImage } = useImageUpload({
    maxSizeMB,
    bucket: bucketName
  });

  // Update preview image when currentImageUrl changes (external updates)
  useEffect(() => {
    if (currentImageUrl !== previewImage) {
      if (previewImage) {
        // Start transition effect
        setIsTransitioning(true);
        
        // After a short delay, update to the new image
        const timer = setTimeout(() => {
          setPreviewImage(currentImageUrl || null);
          setIsTransitioning(false);
        }, 300); // Matching transition duration
        
        return () => clearTimeout(timer);
      } else {
        // If no current preview, just set directly
        setPreviewImage(currentImageUrl || null);
      }
    }
  }, [currentImageUrl, previewImage]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to crop image to square
  const cropToSquare = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate cropping position (center of the image)
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        // Draw the centered square portion of the image
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        
        // Convert back to file
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create blob from canvas'));
            return;
          }
          
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          resolve(croppedFile);
        }, file.type);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for cropping'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // First validate the image 
      const validation = await validateImage(file);
      if (!validation.valid) return;
      
      // Start transition effect
      setIsTransitioning(true);
      
      // Wait a short time for transition to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show preview immediately after validation
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // End transition effect after preview is set
      setTimeout(() => setIsTransitioning(false), 200);
      
      // Check if the image needs cropping
      let fileToUpload = file;
      if (validation.metadata) {
        const { width, height } = validation.metadata;
        if (width !== height) {
          // If not square, crop to square
          fileToUpload = await cropToSquare(file);
        }
      }
      
      // Upload the cropped file
      const uploadedUrl = await uploadImage(fileToUpload);
      
      if (!uploadedUrl) {
        toast.error('Failed to upload image');
        // Reset preview if upload fails
        setIsTransitioning(true);
        setTimeout(() => {
          setPreviewImage(currentImageUrl || null);
          setIsTransitioning(false);
        }, 300);
        return;
      }
      
      // Call the callback with the uploaded URL - this updates parent components
      onImageUploaded(uploadedUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Reset preview if upload fails
      setIsTransitioning(true);
      setTimeout(() => {
        setPreviewImage(currentImageUrl || null);
        setIsTransitioning(false);
      }, 300);
    } finally {
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPreviewImage(null);
      setIsTransitioning(false);
      onImageUploaded('');
    }, 300);
  };

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center group">
        <div className={cn(
          "w-full h-full transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Image Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Upload className="h-10 w-10 mb-2" />
              <span className="text-xs text-center">No image</span>
            </div>
          )}
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <div className="animate-pulse flex flex-col items-center">
              <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
              <span className="text-xs">Uploading...</span>
            </div>
          </div>
        )}
        
        {previewImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
            <button 
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
          JPG, PNG or GIF. Images will be cropped to square.<br />Max {maxSizeMB}MB.
        </p>
      </div>
    </div>
  );
};
