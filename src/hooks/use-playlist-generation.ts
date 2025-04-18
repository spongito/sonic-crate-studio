
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export function usePlaylistGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { subscription, checkSubscription, user } = useAuth();

  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGenerate = async (prompt: string, advancedParams: any) => {
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
      addDebugLog(`Starting generation with prompt: "${prompt}"`);
      addDebugLog(`Using advanced params: ${JSON.stringify(advancedParams)}`);
      
      addDebugLog("Calling process-music-request function...");
      const { data: processedData, error } = await supabase.functions
        .invoke('process-music-request', {
          body: { 
            prompt,
            advancedParams
          }
        });
      
      if (error) {
        console.error("Processing error details:", error);
        addDebugLog(`Error: ${error.message}`);
        
        if (error.message.includes("non-2xx status code") || 
            (processedData && processedData.error && processedData.error.includes("quota"))) {
          toast.error("We're experiencing high demand. Using simplified playlist generation.");
          addDebugLog("Using simplified playlist generation due to API limitations.");
        } else {
          throw error;
        }
      }
      
      if (processedData && processedData.error) {
        addDebugLog(`Function error: ${processedData.error}`);
        if (processedData.error.includes("quota")) {
          toast.error("AI processing limited. Using simplified playlist generation.");
        } else {
          throw new Error(processedData.error);
        }
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
          genres: [advancedParams.genre, processedData.intent?.genre].filter(Boolean),
          settings: {
            ...advancedParams,
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

  return {
    isGenerating,
    playlistData,
    showPlaylist,
    debugLogs,
    handleGenerate
  };
}
