
// Refactored imports for a lighter file
import { searchTracks, searchArtists } from './spotify-client.ts';
import { searchYouTubeVideos } from './youtube-client.ts';
import { saveMasterTrack } from './trackMasterDb.ts';
import { getSeedTracks, combineAndDeduplicateTracks } from './searchUtils.ts';

export async function executeSearchFlow(intent: any, token: string | null, platforms: string[] = ['spotify', 'youtube']) {
  let allTracks = [];
  let seedTracks = [];
  let seedArtists = [];
  const enabledPlatforms = new Set(platforms);

  console.log(`Executing search flow with platforms: ${Array.from(enabledPlatforms).join(', ')}`);
  console.log(`Intent type: ${intent.intent_type || 'not classified'}`);

  try {
    if (enabledPlatforms.has('spotify') && token) {
      console.log("Performing Spotify search...");
      let searchResults: any[] = [];
      let artistIds: string[] = [];

      if (intent.possible_artists && Array.isArray(intent.possible_artists) && intent.possible_artists.length > 0) {
        console.log(`Resolving artists from intent: ${intent.possible_artists.join(', ')}`);
        artistIds = await searchArtists(intent.possible_artists, token);
        if (artistIds.length > 0) {
          console.log(`Resolved artist IDs: ${artistIds.join(', ')}`);
          seedArtists = artistIds;
        }
      }

      // Main search by intent type
      switch (intent.intent_type) {
        case 'artist_search':
        case 'track_search':
        case 'activity_search':
        case 'theme_search':
        default: {
          searchResults = await searchTracks(intent.original_prompt, intent, token, 50, intent.market || 'US');
          break;
        }
      }

      if (searchResults.length > 0) {
        allTracks.push(...searchResults);
        seedTracks = getSeedTracks(searchResults, 5);
        if (seedArtists.length === 0 && searchResults.length > 0) {
          seedArtists = searchResults
            .slice(0, 3)
            .map(track => track.artists?.[0]?.id)
            .filter(Boolean);
        }
      } else {
        console.log("Primary search returned no results, trying fallback strategy");
        const broadSearchResults = await searchTracks(intent.original_prompt,
          { ...intent, intent_type: 'theme_search' },
          token, 50, intent.market || 'US');
        if (broadSearchResults.length > 0) {
          allTracks.push(...broadSearchResults);
          seedTracks = getSeedTracks(broadSearchResults, 5);
        } else if (seedArtists.length > 0) {
          console.log("Both searches returned no results, but we have artist IDs for recommendations");
        } else {
          console.log("All Spotify search strategies failed");
        }
      }

      // Fallback: recommendations
      if ((seedTracks.length > 0 || seedArtists.length > 0) && token) {
        try {
          const { getRecommendations } = await import('./spotify-recommendations.ts');
          console.log(`Getting recommendations using ${seedTracks.length} tracks and ${seedArtists.length} artists`);
          const recos = await getRecommendations(seedTracks, seedArtists, intent, token);
          if (recos && recos.length > 0) {
            allTracks.push(...recos);
          }
        } catch (err) {
          console.error("Spotify recommendations fallback failed", err);
        }
      }
    }

    if (enabledPlatforms.has('youtube')) {
      console.log("Performing YouTube search...");
      let youtubeQuery = `${intent.original_prompt} audio topic`;
      const regionCode = intent.locations && intent.locations[0] !== 'global' ? intent.locations[0] : undefined;

      try {
        console.log(`YouTube search query: ${youtubeQuery}`);
        const youtubeResults = await searchYouTubeVideos(youtubeQuery, 50, regionCode);

        if (youtubeResults.length > 0) {
          let tracksToPush = youtubeResults;
          if (intent.release_year_range && intent.activeFilters?.releaseYear) {
            tracksToPush = youtubeResults.filter(track => {
              const publishYear = track.release_year;
              return publishYear ? (
                publishYear >= intent.release_year_range.min &&
                publishYear <= intent.release_year_range.max
              ) : true;
            });
            console.log(`(YOUTUBE) Year filtering: ${tracksToPush.length} / ${youtubeResults.length}`);
          }
          allTracks.push(...tracksToPush);
        } else {
          console.log("YouTube search returned no results");
        }
      } catch (error) {
        console.error("YouTube API error:", error);
        if (enabledPlatforms.size === 1 && allTracks.length === 0) {
          throw new Error(`YouTube search failed: ${error.message}`);
        }
      }
    }

    if (allTracks.length === 0) {
      if (enabledPlatforms.has('youtube') && enabledPlatforms.size === 1) {
        throw new Error("No YouTube tracks found. The YouTube API may be unavailable or the API key may be invalid. Try enabling Spotify as well or using a different search term.");
      } else if (enabledPlatforms.has('spotify') && enabledPlatforms.size === 1) {
        throw new Error("No Spotify tracks found. Try a different search term or enable YouTube as an additional source.");
      } else {
        throw new Error("No tracks found from any platform. Try a different search term or check your platform settings.");
      }
    }

    allTracks = combineAndDeduplicateTracks(allTracks);
    console.log(`Combined and deduplicated: ${allTracks.length} total tracks`);

    try {
      console.log(`Saving ${allTracks.length} tracks to master database...`);
      for (const track of allTracks) {
        if (track.audio_features && track.spotify_id) {
          await saveMasterTrack(track, track.audio_features);
        } else {
          if (track.spotify_id) {
            console.log(`Track ${track.title || track.name} has no audio features, saving with limited data`);
            await saveMasterTrack(track, null);
          }
        }
      }
    } catch (saveError) {
      console.error("Error saving tracks to database:", saveError);
    }

    return {
      tracks: allTracks,
      seedTracks: seedTracks.slice(0, 5),
      seedArtists: seedArtists.slice(0, 5)
    };
  } catch (error) {
    console.error("Error in search flow:", error);
    throw new Error("Failed to execute search flow: " + error.message);
  }
}
