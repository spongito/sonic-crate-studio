
import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Spotify, Youtube } from "lucide-react";

interface PlaylistHeaderProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onPlatformChange?: (platform: string) => void;
  initialPlatform?: string;
}

export function PlaylistHeader({
  title,
  onTitleChange,
  onPlatformChange,
  initialPlatform = "all"
}: PlaylistHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onTitleChange && editableTitle !== title) {
      onTitleChange(editableTitle);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onTitleChange && editableTitle !== title) {
        onTitleChange(editableTitle);
      }
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <Tabs defaultValue={initialPlatform} onValueChange={onPlatformChange} className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="relative">
            All Platforms
          </TabsTrigger>
          <TabsTrigger value="spotify" className="relative flex items-center gap-2">
            <Spotify className="w-4 h-4 text-green-500" />
            Spotify
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
          </TabsTrigger>
          <TabsTrigger value="youtube" className="relative flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            YouTube
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="text-center">
        {isEditing ? (
          <Input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            className="max-w-md mx-auto text-xl font-bold text-center"
            autoFocus
          />
        ) : (
          <h2 
            onDoubleClick={handleDoubleClick}
            className="text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
          >
            {editableTitle}
          </h2>
        )}
      </div>
    </div>
  );
}
