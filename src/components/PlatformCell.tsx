
import * as React from "react";
import type { Track } from "@/types/table";

/** Handles platform indicators with appropriate colors */
export default function PlatformCell({ track }: PlatformCellProps) {
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
            className="inline-flex items-center mr-2"
          >
            {getPlatformIndicator(platform)}
          </a>
        );
      } else {
        links.push(
          <span key={platform} className="inline-flex items-center mr-2">
            {getPlatformIndicator(platform)}
          </span>
        );
      }
    });
    
    return links;
  };

  return (
    <div className="flex items-center space-x-1">
      {renderPlatformLinks()}
    </div>
  );
}

interface PlatformCellProps {
  track: Track;
}
