
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import type { Platform } from "@/components/PlaylistGenerator/PlatformSelector";

export function usePlaylistGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [debugQueryContext, setDebugQueryContext] = useState<any>(null);
  const { subscription, checkSubscription, user } = useAuth();

  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGenerate = async (prompt: string, advancedParams: any, platforms: Platform[]) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to generate playlists");
      return;
    }
    
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      toast.info("This is a Premium feature. Upgrade to continue.");
      return;
    }
    
    try {
      setIsGenerating(true);
      setDebugLogs([]);
      const filteredParams = getFilteredParams(advancedParams);
      addDebugLog(`Starting generation with prompt: "${prompt}"`);
      addDebugLog(`Using advanced params: ${JSON.stringify(filteredParams)}`);
      
      const enabledPlatforms = platforms.filter(p => p.enabled).map(p => p.id);
      addDebugLog(`Enabled platforms: ${enabledPlatforms.join(', ')}`);
      
      // Set debug context for the query details
      setDebugQueryContext({
        query_text: prompt,
        timestamp: new Date().toISOString(),
        platforms: enabledPlatforms,
        params: filteredParams
      });
      
      addDebugLog("Calling process-music-request function...");
      const { data: processedData, error } = await supabase.functions
        .invoke('process-music-request', {
          body: { 
            prompt,
            advancedParams: filteredParams,
            platforms: enabledPlatforms
          }
        });
      
      if (error) {
        console.error("Processing error details:", error);
        addDebugLog(`Error: ${error.message}`);
        throw error;
      }
      
      if (processedData && processedData.error) {
        addDebugLog(`Function error: ${processedData.error}`);
        throw new Error(processedData.error);
      }
      
      if (!processedData) {
        addDebugLog("Error: No data returned from function");
        throw new Error("Failed to generate playlist data: No data returned");
      }
      
      if (!processedData.tracks) {
        addDebugLog("Error: No tracks returned in the response");
        throw new Error("Failed to generate playlist data: No tracks found");
      }
      
      addDebugLog(`Received ${processedData.tracks?.length || 0} tracks from API`);
      
      if (processedData.intent) {
        addDebugLog(`Detected intent: ${JSON.stringify(processedData.intent, null, 2)}`);
      }

      if (!processedData.tracks || processedData.tracks.length === 0) {
        throw new Error("No tracks found matching your criteria. Please try with different parameters.");
      }
      
      addDebugLog("Saving playlist to database...");
      const { error: insertError } = await supabase
        .from("playlists")
        .insert({
          name: processedData.name || format(new Date(), "MMM d - h:mm a"),
          prompt: prompt,
          description: advancedParams.description,
          results: processedData.tracks || [],
          user_id: user?.id || '',
          is_public: true,
          genres: [advancedParams.genre, ...(processedData.intent?.genres || [])].filter(Boolean),
          settings: {
            ...filteredParams,
            platforms: enabledPlatforms,
            intent: processedData.intent
          }
        });

      if (insertError) {
        console.error("Database insertion error:", insertError);
        addDebugLog(`Database error: ${insertError.message}`);
        toast.error("Playlist was generated but could not be saved.");
      } else {
        addDebugLog("Playlist saved to database successfully");
      }
      
      setPlaylistData(processedData);
      
      if (!subscription?.is_premium) {
        await supabase.functions.invoke('increment-playlist-count');
        await checkSubscription();
        addDebugLog("Incremented playlist count for free tier user");
      }
      
      setShowPlaylist(true);
      toast.success("Playlist generated successfully!");
      addDebugLog("Generation complete!");
      
    } catch (error: any) {
      console.error("Generation error:", error);
      addDebugLog(`Critical error: ${error.message}`);
      toast.error(error.message || "Failed to generate playlist. Please try again with a different prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to filter parameters based on activeFilters
  const getFilteredParams = (params: any) => {
    const filteredParams: any = { ...params };
    
    if (!params.activeFilters.genre) {
      filteredParams.genre = "";
    }
    
    if (!params.activeFilters.location) {
      filteredParams.locations = ["global"];
    }
    
    if (!params.activeFilters.releaseYear) {
      delete filteredParams.releaseYearRange;
    }
    
    if (!params.activeFilters.commercial) {
      filteredParams.commercialFactor = 50;
    }
    
    if (!params.activeFilters.references) {
      delete filteredParams.referenceArtistIds;
      delete filteredParams.referenceTrackIds;
    }
    
    if (!params.activeFilters.bpm || !params.useBpmFilter) {
      delete filteredParams.bpmRange;
      filteredParams.useBpmFilter = false;
    }
    
    // Set default length if not specified
    if (!filteredParams.length) {
      filteredParams.length = "1.5h";
    }
    
    return filteredParams;
  };

  return {
    isGenerating,
    playlistData,
    showPlaylist,
    debugLogs,
    debugQueryContext,
    handleGenerate
  };
}
