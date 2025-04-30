
import React from "react";

interface PlaylistInfoProps {
  name: string;
  description?: string | null;
  prompt?: string;
  createdAt: string;
  tracksCount: number;
  genres?: string[];
}

export function PlaylistInfo({ 
  name, 
  description, 
  prompt, 
  createdAt, 
  tracksCount, 
  genres 
}: PlaylistInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-white">{name}</h1>
        </div>
        <p className="text-muted-foreground">
          {description || prompt}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>Created {new Date(createdAt).toLocaleDateString()}</span>
        <span>•</span>
        <span>{tracksCount} tracks</span>
        {genres && genres.length > 0 && (
          <>
            <span>•</span>
            <span>{genres.join(", ")}</span>
          </>
        )}
      </div>
    </div>
  );
}
