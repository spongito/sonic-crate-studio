
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { toast } from "sonner";

interface PlaylistEditModalProps {
  isOpen: boolean;
  playlistName: string;
  coverImageUrl: string;
  onClose: () => void;
  onSave: (name: string, coverUrl: string) => void;
}

export const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({
  isOpen,
  playlistName,
  coverImageUrl,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(playlistName);
  const [coverUrl, setCoverUrl] = useState(coverImageUrl);
  const [previewCoverUrl, setPreviewCoverUrl] = useState(coverImageUrl);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form when modal opens/closes or props change
  useEffect(() => {
    if (isOpen) {
      setName(playlistName);
      setCoverUrl(coverImageUrl);
      setPreviewCoverUrl(coverImageUrl);
    }
  }, [isOpen, playlistName, coverImageUrl]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Playlist name cannot be empty');
      return;
    }
    
    onSave(name, coverUrl);
  };

  const handleImageUploaded = (url: string) => {
    setCoverUrl(url);
    setPreviewCoverUrl(url); // Update preview immediately
  };

  const handleCancel = () => {
    // Reset form
    setName(playlistName);
    setCoverUrl(coverImageUrl);
    setPreviewCoverUrl(coverImageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Playlist</DialogTitle>
          <DialogDescription>
            Modify your playlist name and cover image
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Playlist Name Input */}
          <div>
            <label htmlFor="playlist-name" className="block text-sm font-medium text-muted-foreground mb-2">
              Playlist Name
            </label>
            <Input 
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Cover Image
            </label>
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              currentImageUrl={previewCoverUrl}
              maxSizeMB={8}
              bucketName="playlist_covers"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
