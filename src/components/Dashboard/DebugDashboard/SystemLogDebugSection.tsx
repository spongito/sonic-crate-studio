import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { SearchQuery } from "./types";
import { QueryDebugInformation } from "./QueryDebugInformation";

interface SystemLogDebugSectionProps {
  query: SearchQuery;
}

export function SystemLogDebugSection({ query }: SystemLogDebugSectionProps) {
  const [copied, setCopied] = useState(false);
  
  const buildSpotifyQueryString = () => {
    if (!query.query_text) return "";
    
    let queryString = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query.query_text)}`;
    
    if (query.genre) queryString += ` genre:${query.genre}`;
    if (query.reference_artists?.length) queryString += ` artist:${query.reference_artists[0]}`;
    
    queryString += "&type=track";
    queryString += "&limit=50";
    
    if (query.location?.length && query.location[0] !== "global") {
      queryString += `&market=${query.location[0]}`;
    }
    
    return queryString;
  };
  
  const buildYouTubeQueryString = () => {
    if (!query.query_text) return "";
    
    let queryText = query.query_text;
    if (query.genre) queryText += ` ${query.genre}`;
    if (query.reference_artists?.length) queryText += ` ${query.reference_artists[0]}`;
    
    if (query.release_year_min && query.release_year_max) {
      if (query.release_year_min === query.release_year_max) {
        queryText += ` ${query.release_year_min}`;
      } else {
        queryText += ` ${query.release_year_min}-${query.release_year_max}`;
      }
    }
    
    queryText += " official audio OR visualizer -\"music video\" -\"live\" -\"reaction\" -\"cover\"";
    
    let queryString = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(queryText)}`;
    queryString += "&maxResults=50&type=video&videoCategoryId=10&videoDuration=medium&videoEmbeddable=true";
    
    if (query.location?.length && query.location[0] !== "global") {
      queryString += `&regionCode=${query.location[0]}`;
    }
    
    return queryString;
  };
  
  const generateDebugLogs = () => {
    const lines = [];
    
    lines.push(`SEARCH QUERY: "${query.query_text}"`);
    lines.push(`TIMESTAMP: ${new Date(query.timestamp || "").toLocaleString()}`);
    
    if (query.platforms?.length) {
      lines.push(`PLATFORMS: ${query.platforms.join(", ")}`);
    }
    
    if (query.genre) {
      lines.push(`GENRE: ${query.genre}`);
    }
    
    if (query.reference_artists?.length) {
      lines.push(`REFERENCE ARTISTS: ${query.reference_artists.join(", ")}`);
    }
    
    if (query.reference_tracks?.length) {
      lines.push(`REFERENCE TRACKS: ${query.reference_tracks.join(", ")}`);
    }
    
    if (query.location?.length) {
      lines.push(`LOCATION: ${query.location.join(", ")}`);
    }
    
    if (query.release_year_min && query.release_year_max) {
      lines.push(`RELEASE YEAR RANGE: ${query.release_year_min} - ${query.release_year_max}`);
    }
    
    if (query.bpm_min && query.bpm_max) {
      lines.push(`BPM RANGE: ${query.bpm_min} - ${query.bpm_max}`);
    }
    
    if (query.commercial_factor !== null && query.commercial_factor !== undefined) {
      lines.push(`COMMERCIAL FACTOR: ${query.commercial_factor}/100`);
    }
    
    if (query.length_minutes) {
      lines.push(`PLAYLIST LENGTH: ${query.length_minutes} minutes`);
    }
    
    lines.push("\n=== SPOTIFY API QUERY ===");
    lines.push(buildSpotifyQueryString());
    
    lines.push("\n=== YOUTUBE API QUERY ===");
    lines.push(buildYouTubeQueryString());
    
    return lines.join('\n');
  };

  const copyToClipboard = async () => {
    const text = generateDebugLogs();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <QueryDebugInformation 
        query={query}
        spotifyApiQuery={buildSpotifyQueryString()}
        youtubeApiQuery={buildYouTubeQueryString()}
        debugLogs={generateDebugLogs().split('\n')}
      />
    </div>
  );
}
