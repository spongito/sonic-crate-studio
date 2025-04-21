
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { SearchQuery } from "./types";

interface SystemLogDebugSectionProps {
  query: SearchQuery;
}

export function SystemLogDebugSection({ query }: SystemLogDebugSectionProps) {
  const [copied, setCopied] = useState(false);
  
  // Build Spotify query URL based on the query parameters
  const buildSpotifyQueryString = () => {
    if (!query.query_text) return "";
    
    let queryString = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query.query_text)}`;
    
    // Add additional params if available
    if (query.genre) queryString += ` genre:${query.genre}`;
    if (query.reference_artists?.length) queryString += ` artist:${query.reference_artists[0]}`;
    
    queryString += "&type=track";
    queryString += "&limit=50";
    
    if (query.location?.length && query.location[0] !== "global") {
      queryString += `&market=${query.location[0]}`;
    }
    
    return queryString;
  };
  
  // Build YouTube query URL based on the query parameters
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
    
    // Add YouTube-specific terms
    queryText += " official audio OR visualizer -\"music video\" -\"live\" -\"reaction\" -\"cover\"";
    
    // Build the URL
    let queryString = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(queryText)}`;
    queryString += "&maxResults=50&type=video&videoCategoryId=10&videoDuration=medium&videoEmbeddable=true";
    
    if (query.location?.length && query.location[0] !== "global") {
      queryString += `&regionCode=${query.location[0]}`;
    }
    
    return queryString;
  };
  
  // Generate debug logs
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
    
    // Add API query URLs
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
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-semibold text-sm">Debug Information</h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 gap-1 text-xs"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy All
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="glass-morphism rounded-lg p-3">
          <h4 className="text-xs font-medium mb-1 text-white/70">Search Query</h4>
          <div className="text-xs font-mono">{query.query_text}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-morphism rounded-lg p-3">
            <h4 className="text-xs font-medium mb-1 text-white/70">Platforms</h4>
            <div className="text-xs font-mono overflow-x-auto">
              {query.platforms?.join(", ") || "None specified"}
            </div>
          </div>
          
          <div className="glass-morphism rounded-lg p-3">
            <h4 className="text-xs font-medium mb-1 text-white/70">Filters</h4>
            <div className="text-xs font-mono overflow-x-auto space-y-1">
              {query.genre && <div>Genre: {query.genre}</div>}
              {query.release_year_min && query.release_year_max && (
                <div>Year: {query.release_year_min} - {query.release_year_max}</div>
              )}
              {query.commercial_factor !== null && query.commercial_factor !== undefined && (
                <div>Commercial: {query.commercial_factor}/100</div>
              )}
              {query.location?.length ? (
                <div>Location: {query.location.join(", ")}</div>
              ) : null}
              {query.bpm_min && query.bpm_max && (
                <div>BPM: {query.bpm_min} - {query.bpm_max}</div>
              )}
              {query.length_minutes && (
                <div>Length: {query.length_minutes} minutes</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-morphism rounded-lg p-3">
            <h4 className="text-xs font-medium mb-1 text-white/70">Spotify Query</h4>
            <div className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {buildSpotifyQueryString() || "No Spotify query"}
            </div>
          </div>
          
          <div className="glass-morphism rounded-lg p-3">
            <h4 className="text-xs font-medium mb-1 text-white/70">YouTube Query</h4>
            <div className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {buildYouTubeQueryString() || "No YouTube query"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
