import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Bug } from "lucide-react";
import PlaylistViewer from "@/components/Dashboard/PlaylistViewer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AdvancedSettings, type AdvancedSettingsParams } from "@/components/Dashboard/MusicFinder/AdvancedSettings";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MusicFinder = () => {
  const [prompt, setPrompt] = useState("");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const { subscription, checkSubscription, user } = useAuth();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const [advancedParams, setAdvancedParams] = useState<AdvancedSettingsParams>({
    mode: "club-ready",
    description: "",
    genre: "",
    length: "1.5h",
    commercialFactor: 50,
    referenceArtists: ""
  });

  const handleReset = () => {
    setAdvancedParams({
      mode: "club-ready",
      description: "",
      genre: "",
      length: "1.5h",
      commercialFactor: 50,
      referenceArtists: ""
    });
    setPrompt("");
    setDebugLogs([]);
  };

  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGenerate = async () => {
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
      
    } catch (error) {
      console.error("Generation error:", error);
      addDebugLog(`Critical error: ${error.message}`);
      toast.error(error.message || "Failed to generate playlist. Please try again with a different prompt.");
      setShowDebug(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Music Finder
            </h1>
            <p className="text-white/60">
              Describe the mood, genre, or occasion and let our AI create the perfect playlist for you.
            </p>
            
            <div className="glass-morphism p-4 space-y-6 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="curate a soulful afrobeat set for golden hour"
                  className="flex-1 bg-white/5 border-white/10 focus:border-gold/30 focus:ring-gold/20"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  disabled={isGenerating}
                />
                <Button 
                  className="neo-gold-button"
                  onClick={handleGenerate}
                  disabled={isGenerating || (!subscription?.is_premium && subscription?.remaining_generations === 0)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Find Songs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              <AdvancedSettings
                params={advancedParams}
                onChange={setAdvancedParams}
                onReset={handleReset}
              />
            </div>
            
            {showPlaylist && (
              <div className="mt-8 animate-fade-in">
                <PlaylistViewer playlistData={playlistData} />
              </div>
            )}
            
            <Collapsible 
              open={showDebug} 
              onOpenChange={setShowDebug}
              className="mt-8 glass-morphism p-2 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between px-4">
                <h3 className="text-sm font-medium">Debug Information</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Bug className="h-4 w-4 mr-2" />
                    {showDebug ? "Hide" : "Show"} Debug Logs
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2">
                <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto text-xs font-mono">
                  {debugLogs.length === 0 ? (
                    <p className="text-gray-400">No logs yet. Generate a playlist to see debug information.</p>
                  ) : (
                    <div className="space-y-1">
                      {debugLogs.map((log, index) => (
                        <p key={index} className="text-gray-300">{log}</p>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MusicFinder;
