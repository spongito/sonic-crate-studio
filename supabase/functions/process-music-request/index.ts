import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { createStructuredIntent } from './intent-analyzer.ts';
import { getSpotifyToken } from './spotify-client.ts';
import { executeSearchFlow } from './search-flow.ts';
import { scoreTracksBasedOnIntent, generatePlaylistName } from './track-scorer.ts';

// Supabase JS client for inserting log entries
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    if (!req.body) {
      throw new Error("Request body is required");
    }

    // Attempt to get the user id from Supabase auth JWT in authorization header if present
    let userId: string | null = null;
    try {
      const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      // There isn't direct supabase.auth.getUser() in Edge functions, so we parse JWT manually
      const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      }
    } catch (err) {
      console.error("Error retrieving user from auth header:", err);
      // proceed without user ID
    }

    const { prompt, advancedParams, platforms = ['spotify', 'youtube'] } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error("A valid text prompt is required");
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      throw new Error("At least one platform must be selected");
    }

    console.log("Request received:", { prompt, advancedParams, platforms });

    // Intent Analysis
    const intent = await createStructuredIntent(prompt, advancedParams).catch(error => {
      console.error("Intent analysis failed:", error);
      throw new Error("Failed to analyze music request: " + error.message);
    });
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));

    // Log query to database
    try {
      await supabaseAdmin
        .from('search_queries')
        .insert({
          user_id: userId,
          query_text: prompt,
          genre: advancedParams.genre || intent.genre || null,
          reference_artists: advancedParams.referenceArtistIds || intent.reference_artists || [],
          reference_tracks: advancedParams.referenceTrackIds || intent.reference_track_ids || [],
          location: advancedParams.locations || (intent.market ? [intent.market] : []),
          platforms: platforms,
          length_minutes: intent.set_length_minutes || null,
          bpm_min: advancedParams.bpmRange ? advancedParams.bpmRange[0] : null,
          bpm_max: advancedParams.bpmRange ? advancedParams.bpmRange[1] : null,
          release_year_min: advancedParams.releaseYearRange ? advancedParams.releaseYearRange[0] : null,
          release_year_max: advancedParams.releaseYearRange ? advancedParams.releaseYearRange[1] : null,
          commercial_factor: advancedParams.commercialFactor || null,
          timestamp: new Date().toISOString()
        });
      console.log("[LOG] Search query tracked:", {
        userId,
        query: prompt,
        platforms,
        genre: advancedParams.genre || intent.genre,
        bpm: advancedParams.bpmRange,
        releaseYear: advancedParams.releaseYearRange,
      });
    } catch (logError) {
      console.error("Failed to log search query:", logError);
    }

    // Process additional advanced parameters into intent as before:
    if (advancedParams?.releaseYearRange && Array.isArray(advancedParams.releaseYearRange) && advancedParams.releaseYearRange.length === 2) {
      intent.release_year_range = {
        min: advancedParams.releaseYearRange[0],
        max: advancedParams.releaseYearRange[1]
      };
    }

    if (advancedParams?.useBpmFilter && advancedParams?.bpmRange && Array.isArray(advancedParams.bpmRange) && advancedParams.bpmRange.length === 2) {
      intent.bpm_range = {
        min: advancedParams.bpmRange[0],
        max: advancedParams.bpmRange[1]
      };
    }

    if (advancedParams?.locations && Array.isArray(advancedParams.locations) && advancedParams.locations.length > 0) {
      intent.market = advancedParams.locations[0];
    }

    if (advancedParams?.referenceTrackIds && Array.isArray(advancedParams.referenceTrackIds) && advancedParams.referenceTrackIds.length > 0) {
      intent.reference_track_ids = advancedParams.referenceTrackIds;
    }

    if (advancedParams?.referenceArtistIds && Array.isArray(advancedParams.referenceArtistIds) && advancedParams.referenceArtistIds.length > 0) {
      intent.reference_artist_ids = advancedParams.referenceArtistIds;
    }

    let allTracks = [];
    let seedTracks = null;
    let seedArtists = null;
    let spotifyToken = null;

    if (platforms.includes('spotify')) {
      try {
        spotifyToken = await getSpotifyToken();
        console.log("Obtained Spotify token successfully");

        const spotifyResults = await executeSearchFlow(intent, spotifyToken, ['spotify']).catch(error => {
          console.error("Spotify search failed:", error);
          return { tracks: [], seedTracks: [], seedArtists: [] };
        });

        if (spotifyResults?.tracks?.length > 0) {
          allTracks = [...allTracks, ...spotifyResults.tracks];
          seedTracks = spotifyResults.seedTracks;
          seedArtists = spotifyResults.seedArtists;
          console.log(`Found ${spotifyResults.tracks.length} tracks through Spotify search`);
        } else {
          console.log("No Spotify tracks found");
        }
      } catch (error) {
        console.error("Spotify processing error:", error);
        console.log("Continuing with other platforms due to Spotify failure");
      }
    }

    if (platforms.includes('youtube')) {
      try {
        if (!Deno.env.get('YOUTUBE_API_KEY')) {
          throw new Error("YouTube API key is not configured");
        }

        const youtubeResults = await executeSearchFlow(intent, null, ['youtube']).catch(error => {
          console.error("YouTube search failed:", error);
          return { tracks: [] };
        });

        if (youtubeResults?.tracks?.length > 0) {
          allTracks = [...allTracks, ...youtubeResults.tracks];
          console.log(`Found ${youtubeResults.tracks.length} tracks through YouTube search`);
        } else {
          console.log("No YouTube tracks found");
        }
      } catch (error) {
        console.error("YouTube processing error:", error);
        console.log("Continuing with other platforms due to YouTube failure");
      }
    }

    if (allTracks.length === 0) {
      throw new Error("No tracks found matching your criteria. Try different search terms or platforms.");
    }

    let recommendedTracks = [];
    if (platforms.includes('spotify') && spotifyToken && seedTracks && seedTracks.length > 0) {
      try {
        const { getRecommendations } = await import('./spotify-recommendations.ts');
        recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
          console.error("Recommendations failed:", error);
          return [];
        });
        console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
      } catch (error) {
        console.error("Failed to get recommendations:", error);
      }
    }

    const combinedTracks = [...allTracks, ...recommendedTracks];
    if (combinedTracks.length === 0) {
      throw new Error("No tracks could be found or recommended. Please try different search criteria.");
    }

    const validTracks = combinedTracks.filter(track => track !== null && track !== undefined);

    const uniqueTracks = Array.from(new Map(validTracks.map(track =>
      [track.id || track.spotify_id || track.youtube_id, track]
    )).values());
    console.log(`Combined unique tracks: ${uniqueTracks.length}`);

    console.log("Enriching tracks with audio features...");
    let tracksWithFeatures = uniqueTracks;

    if (platforms.includes('spotify') && spotifyToken) {
      const spotifyTracks = uniqueTracks.filter(track => track.platform === 'spotify');
      if (spotifyTracks.length > 0) {
        try {
          const { enrichTracksWithAudioFeatures } = await import('./spotify-track-utils.ts');
          const enrichedSpotifyTracks = await enrichTracksWithAudioFeatures(spotifyTracks, spotifyToken).catch(error => {
            console.error("Audio features enrichment failed:", error);
            return spotifyTracks;
          });

          const nonSpotifyTracks = uniqueTracks.filter(track => track.platform !== 'spotify');
          tracksWithFeatures = [...enrichedSpotifyTracks, ...nonSpotifyTracks];
        } catch (error) {
          console.error("Failed to import spotify-track-utils:", error);
        }
      }
    }

    if (intent.release_year_range) {
      tracksWithFeatures = tracksWithFeatures.filter(track => {
        const year = track.release_year || (track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4)) : null);
        return year ? (year >= intent.release_year_range.min && year <= intent.release_year_range.max) : true;
      });
      console.log(`After release year filtering: ${tracksWithFeatures.length} tracks`);
    }

    if (intent.bpm_range) {
      tracksWithFeatures = tracksWithFeatures.filter(track => {
        const bpm = track.audio_features?.tempo || track.audio_features?.bpm;
        return bpm ? (bpm >= intent.bpm_range.min && bpm <= intent.bpm_range.max) : true;
      });
      console.log(`After BPM filtering: ${tracksWithFeatures.length} tracks`);
    }

    const scoredTracks = scoreTracksBasedOnIntent(tracksWithFeatures, intent);
    if (scoredTracks.length === 0) {
      throw new Error("Failed to score and rank tracks. Please try again.");
    }

    const finalPlaylist = {
      tracks: scoredTracks.slice(0, 20),
      intent: intent,
      created_at: new Date().toISOString(),
      name: generatePlaylistName(intent),
      total_tracks_found: uniqueTracks.length,
      recommendation_confidence: calculateConfidenceScore(scoredTracks.slice(0, 20)),
      platforms: platforms
    };

    console.log("Created playlist with tracks:", finalPlaylist.tracks.length);

    return new Response(JSON.stringify(finalPlaylist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing music request:", error);

    const errorResponse = {
      error: error.message,
      type: categorizeError(error),
      details: error.toString(),
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: determineErrorStatus(error),
    });
  }
});

function calculateConfidenceScore(tracks: any[]): number {
  if (!tracks.length) return 0;
  const avgScore = tracks.reduce((sum, track) => sum + (track.match_score || 0), 0) / tracks.length;
  return Math.round(avgScore);
}

function categorizeError(error: Error): string {
  if (error.message.includes("Spotify")) return "SPOTIFY_API_ERROR";
  if (error.message.includes("YouTube")) return "YOUTUBE_API_ERROR";
  if (error.message.includes("prompt")) return "INVALID_INPUT";
  if (error.message.includes("No tracks")) return "NO_RESULTS";
  if (error.message.includes("authenticate")) return "AUTH_ERROR";
  return "UNKNOWN_ERROR";
}

function determineErrorStatus(error: Error): number {
  if (error.message.includes("required") || !error.message) return 400;
  if (error.message.includes("authenticate")) return 401;
  if (error.message.includes("No tracks") || error.message.includes("Failed to score")) return 404;
  return 500;
}
