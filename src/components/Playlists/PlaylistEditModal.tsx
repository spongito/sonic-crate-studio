
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { toast } from "sonner";
import { PlaylistCover, CoverTemplate } from "@/components/PlaylistCover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [useTemplate, setUseTemplate] = useState(!coverImageUrl);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate>('A');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Playlist name cannot be empty');
      return;
    }
    
    // If using a template, we don't need to save an actual image URL
    // We'll save the template type in the database instead
    const finalCoverUrl = useTemplate 
      ? `template:${selectedTemplate}` 
      : coverUrl;
    
    onSave(name, finalCoverUrl);
    onClose();
  };

  const handleImageUploaded = (url: string) => {
    setCoverUrl(url);
    setUseTemplate(false);
  };

  const handleTabChange = (value: string) => {
    setUseTemplate(value === 'template');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
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

          {/* Cover Options */}
          <Tabs defaultValue={useTemplate ? "template" : "upload"} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="template">Use Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="pt-4">
              <ImageUploader 
                onImageUploaded={handleImageUploaded}
                currentImageUrl={!useTemplate ? coverUrl : ''}
                maxSizeMB={8}
                bucketName="playlist_covers"
              />
            </TabsContent>
            
            <TabsContent value="template" className="pt-4">
              <div className="space-y-4">
                <Label>Select Template</Label>
                <RadioGroup 
                  defaultValue={selectedTemplate}
                  onValueChange={(v) => setSelectedTemplate(v as CoverTemplate)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-md border border-muted">
                      <PlaylistCover name={name || "Playlist"} template="A" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id="template-a" />
                      <Label htmlFor="template-a">Gradient</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-md border border-muted">
                      <PlaylistCover name={name || "Playlist"} template="B" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id="template-b" />
                      <Label htmlFor="template-b">Texture</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-md border border-muted">
                      <PlaylistCover name={name || "Playlist"} template="C" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id="template-c" />
                      <Label htmlFor="template-c">Pattern</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
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
