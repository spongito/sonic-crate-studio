
import React, { useState } from 'react';
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
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Playlist name cannot be empty');
      return;
    }
    
    onSave(name, coverUrl);
    onClose();
  };

  const handleImageUploaded = (url: string) => {
    setCoverUrl(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              currentImageUrl={coverUrl}
              maxSizeMB={8}
              bucketName="playlist_covers"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
