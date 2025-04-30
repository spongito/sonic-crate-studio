
import { mergeAndDedupeTracks, scoreAndSortTracks, createBatches } from './trackMerger';
import { SupabaseClient } from '@supabase/supabase-js';
import { JobStatus } from '@/types/job';

// Configuration for debugging
const LOG_DEBUG = process.env.NODE_ENV === 'development';

// Helper function for retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delay = 1000,
  sourceName = "API"
): Promise<{ data: T | null; error: Error | null }> {
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      const result = await fn();
      return { data: result, error: null };
    } catch (error) {
      attempt++;
      
      if (attempt > retries) {
        if (LOG_DEBUG) console.error(`${sourceName} failed after ${attempt} attempts:`, error);
        return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
      }
      
      if (LOG_DEBUG) console.log(`${sourceName} retry ${attempt}/${retries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  return { data: null, error: new Error(`Unexpected error in ${sourceName}`) };
}

/**
 * Processes search results through Spotify and YouTube APIs
 * @param supabase Supabase client for database operations
 * @param jobId ID of the current job
 * @param intent Parsed intent object with search parameters
 */
export async function orchestrateApiCalls(
  supabase: SupabaseClient,
  jobId: string,
  intent: any
) {
  try {
    const failedPlatforms: string[] = [];
    
    // 1. Get Spotify token
    const spotifyToken = await getSpotifyToken();
    if (!spotifyToken) {
      failedPlatforms.push('spotify');
      await updateJobStatus(supabase, jobId, 'processing', { failed_platforms: failedPlatforms });
    }
    
    // 2. Execute Spotify search
    let spotifyTracks: any[] = [];
    if (spotifyToken) {
      if (LOG_DEBUG) console.log('Starting Spotify search');
      
      const { data: searchResults, error: searchError } = await withRetry(
        () => searchTracks(intent.prompt, intent, spotifyToken, 50),
        1,
        1000,
        'Spotify search'
      );
      
      if (searchResults && Array.isArray(searchResults)) {
        spotifyTracks = searchResults;
        if (LOG_DEBUG) console.log(`Spotify search returned ${spotifyTracks.length} results`);
        
        // If we got fewer than 10 tracks, try recommendations as fallback
        if (spotifyTracks.length < 10) {
          if (LOG_DEBUG) console.log('Less than 10 tracks, trying recommendations');
          
          const { data: recommendationResults } = await withRetry(
            () => getRecommendations(intent, spotifyToken),
            1,
            1000,
            'Spotify recommendations'
          );
          
          if (recommendationResults && Array.isArray(recommendationResults)) {
            if (LOG_DEBUG) console.log(`Recommendations returned ${recommendationResults.length} additional tracks`);
            spotifyTracks.push(...recommendationResults);
          }
        }
      } else {
        failedPlatforms.push('spotify');
        if (LOG_DEBUG) console.error('Spotify search failed:', searchError);
      }
    }
    
    // 3. Execute YouTube search in parallel with audio features
    let youtubeTracks: any[] = [];
    const youtubePromise = (async () => {
      if (LOG_DEBUG) console.log('Starting YouTube search');
      
      const { data: youtubeResults, error: youtubeError } = await withRetry(
        () => searchYouTubeVideos(intent.prompt),
        1,
        1000,
        'YouTube search'
      );
      
      if (youtubeResults && Array.isArray(youtubeResults)) {
        youtubeTracks = youtubeResults;
        if (LOG_DEBUG) console.log(`YouTube search returned ${youtubeTracks.length} results`);
      } else {
        failedPlatforms.push('youtube');
        if (LOG_DEBUG) console.error('YouTube search failed:', youtubeError);
      }
    })();
    
    // 4. Fetch audio features for all Spotify tracks
    let tracksWithFeatures = [...spotifyTracks];
    if (spotifyTracks.length > 0 && spotifyToken) {
      if (LOG_DEBUG) console.log('Fetching audio features');
      
      const { data: enrichedTracks, error: featuresError } = await withRetry(
        () => enrichTracksWithAudioFeatures(spotifyTracks, spotifyToken),
        1,
        1000,
        'Audio features'
      );
      
      if (enrichedTracks) {
        tracksWithFeatures = enrichedTracks;
        if (LOG_DEBUG) console.log(`Enriched ${tracksWithFeatures.length} tracks with audio features`);
      } else {
        if (LOG_DEBUG) console.error('Audio features fetch failed:', featuresError);
      }
    }
    
    // Wait for YouTube search to complete
    await youtubePromise;
    
    // Update job status with failed platforms
    if (failedPlatforms.length > 0) {
      await updateJobStatus(supabase, jobId, 'processing', { failed_platforms: failedPlatforms });
    }
    
    // 5. Merge and dedupe results
    const mergedTracks = mergeAndDedupeTracks(tracksWithFeatures, youtubeTracks);
    if (LOG_DEBUG) console.log(`${mergedTracks.length} tracks after merge & dedupe`);
    
    // 6. Score and sort
    const finalTracks = scoreAndSortTracks(mergedTracks);
    if (LOG_DEBUG) console.log('Tracks scored and sorted');
    
    // 7. Batch upsert to tracks_master
    const batches = createBatches(finalTracks, 25);
    let batchesProcessed = 0;
    
    // Update job status to indicate merging has begun
    await updateJobStatus(supabase, jobId, 'merging_results');
    
    // Process each batch
    for (const batch of batches) {
      const batchPromises = batch.map(track => {
        const audioFeatures = track.audio_features || {};
        return saveMasterTrack(track, audioFeatures);
      });
      
      await Promise.all(batchPromises);
      batchesProcessed++;
      
      if (LOG_DEBUG) console.log(`Batch ${batchesProcessed}/${batches.length} processed`);
    }
    
    // Update job status to ready for review
    await updateJobStatus(supabase, jobId, 'ready_for_review', { 
      results: finalTracks,
      failed_platforms: failedPlatforms
    });
    
    return finalTracks;
    
  } catch (error) {
    if (LOG_DEBUG) console.error('Error in orchestrateApiCalls:', error);
    await updateJobStatus(supabase, jobId, 'error', { error_message: String(error) });
    throw error;
  }
}

/**
 * Updates the job status in the database
 * @param supabase Supabase client
 * @param jobId Job ID
 * @param status New status
 * @param additionalData Additional data to update
 */
async function updateJobStatus(
  supabase: SupabaseClient, 
  jobId: string, 
  status: JobStatus, 
  additionalData: Record<string, any> = {}
) {
  await supabase
    .from('jobs')
    .update({
      status,
      ...additionalData,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);
  
  if (LOG_DEBUG) console.log(`Job ${jobId} status updated to ${status}`);
}

// API function stubs - these will actually be called via the edge functions
async function getSpotifyToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/spotify-token');
    if (!response.ok) return null;
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    return null;
  }
}

async function searchTracks(query: string, intent: any, token: string, limit: number): Promise<any[]> {
  try {
    const response = await fetch('/api/spotify-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, intent, limit })
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
}

async function getRecommendations(intent: any, token: string): Promise<any[]> {
  try {
    const response = await fetch('/api/spotify-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ intent })
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

async function enrichTracksWithAudioFeatures(tracks: any[], token: string): Promise<any[]> {
  try {
    const trackIds = tracks.map(track => track.id).filter(Boolean);
    if (trackIds.length === 0) return tracks;
    
    const response = await fetch('/api/spotify-audio-features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ trackIds })
    });
    
    if (!response.ok) return tracks;
    const data = await response.json();
    
    // Merge audio features back into tracks
    return tracks.map(track => {
      const features = data.audioFeatures?.find((f: any) => f.id === track.id);
      if (features) {
        return {
          ...track,
          audio_features: features
        };
      }
      return track;
    });
  } catch (error) {
    console.error("Error enriching tracks with audio features:", error);
    return tracks;
  }
}

async function searchYouTubeVideos(query: string): Promise<any[]> {
  try {
    const response = await fetch('/api/youtube-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error("Error searching YouTube videos:", error);
    return [];
  }
}

async function saveMasterTrack(track: any, audioFeatures: any): Promise<string | null> {
  try {
    const response = await fetch('/api/save-master-track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ track, audioFeatures })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error saving master track:", error);
    return null;
  }
}
