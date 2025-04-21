
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PlaylistTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
}

export function PlaylistTitle({ title, onTitleChange }: PlaylistTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onTitleChange && editableTitle.trim()) {
        onTitleChange(editableTitle);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditableTitle(title);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setEditableTitle(title);
  };

  if (isEditing) {
    return (
      <Input
        value={editableTitle}
        onChange={(e) => setEditableTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        className="max-w-md text-2xl font-bold px-3 animate-in fade-in zoom-in"
      />
    );
  }

  return (
    <h2 
      onDoubleClick={handleDoubleClick} 
      className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
    >
      {title}
    </h2>
  );
}
