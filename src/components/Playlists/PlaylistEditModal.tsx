
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";

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
  const [previewImage, setPreviewImage] = useState(coverImageUrl);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(name, coverUrl);
    onClose();
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
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden relative">
                <img 
                  src={previewImage || "/placeholder.svg"} 
                  alt="Playlist Cover" 
                  className="w-full h-full object-cover"
                />
                {previewImage && (
                  <button 
                    onClick={() => {
                      setCoverUrl('');
                      setPreviewImage('');
                    }}
                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
