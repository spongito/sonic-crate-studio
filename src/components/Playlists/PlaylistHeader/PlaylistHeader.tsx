
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PlaylistHeaderProps {
  playlist: {
    name: string;
    description?: string | null;
    prompt?: string;
    created_at: string;
    genres?: string[];
  };
  tracks: any[];
  onEditClick: () => void;
  coverImageUrl?: string;
  onNameChange?: (newName: string) => Promise<boolean>;
}

export function PlaylistHeader({ playlist, tracks, onEditClick, coverImageUrl, onNameChange }: PlaylistHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);

  const handleSaveName = async () => {
    if (!onNameChange) return;
    
    const success = await onNameChange(editedName);
    if (success) {
      setIsEditingName(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* Cover Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg relative">
        <img 
          src={coverImageUrl || "/placeholder.svg"}
          alt={playlist.name}
          className="w-full h-full object-cover"
        />
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={onEditClick}
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="space-y-4">
        <div>
          {isEditingName && onNameChange ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold py-1 h-auto"
                autoFocus
              />
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleSaveName}
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
              {onNameChange && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-50 hover:opacity-100"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <p className="text-muted-foreground">
            {playlist.description || playlist.prompt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{tracks.length || 0} tracks</span>
          {playlist.genres && playlist.genres.length > 0 && (
            <>
              <span>•</span>
              <span>{playlist.genres.join(", ")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
