
import * as React from "react";
import type { Track } from "@/types/table";
import { Apple, ExternalLink, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Handles title, artist (with array support), album art (with fallback). */
export default function TrackCell({ track }: TrackCellProps) {
  const artistDisplay = Array.isArray(track.artist)
    ? track.artist.join(", ")
    : track.artist;
  const imageUrl = track.albumArt || track.image_url;
  
  // Generate platform links with icons
  const renderPlatformLinks = () => {
    const links = [];
    let platforms: string[] = [];
    
    if (Array.isArray(track.platform)) {
      platforms = track.platform;
    } else if (track.platform) {
      platforms = [track.platform as string];
    }
    
    // Function to get platform URL
    const getPlatformUrl = (platform: string) => {
      if (track.platform_url) return track.platform_url;
      if (platform.toLowerCase() === 'spotify' && track.spotify_id) {
        return `https://open.spotify.com/track/${track.spotify_id}`;
      }
      return null;
    };
    
    // Function to get platform indicator
    const getPlatformIndicator = (platform: string) => {
      switch (platform.toLowerCase()) {
        case 'spotify':
          return <div className="w-3 h-3 rounded-full bg-green-500" />;
        case 'apple music':
        case 'apple':
          return <div className="w-3 h-3 rounded-full bg-red-500" />;
        case 'youtube':
          return <div className="w-3 h-3 rounded-full bg-red-500" />;
        default:
          return <div className="w-3 h-3 rounded-full bg-gray-500" />;
      }
    };
    
    platforms.forEach((platform) => {
      const url = getPlatformUrl(platform);
      if (url) {
        links.push(
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            {getPlatformIndicator(platform)}
          </a>
        );
      } else {
        links.push(getPlatformIndicator(platform));
      }
    });
    
    return links;
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <img
        src={imageUrl}
        alt={`${track.title} cover`}
        className="w-10 h-10 rounded-md shadow-sm object-cover"
        onError={(e) => {
          e.currentTarget.src = "/album-placeholder.svg";
        }}
      />
      <div className="flex flex-col">
        <div className="font-medium text-sm">{track.title}</div>
        <div className="text-xs text-muted-foreground">{artistDisplay}</div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        {renderPlatformLinks()}
      </div>
    </div>
  );
}

interface TrackCellProps {
  track: Track;
}

