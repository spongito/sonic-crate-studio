
import { searchTracks, searchArtists, getArtistTopTracks, getRelatedArtists } from './spotify-client.ts';

export async function executeSearchFlow(intent: any, token: string) {
  let allTracks = [];
  let seedTracks = [];
  let seedArtists = [];
  
  try {
    if (intent.reference_artists && intent.reference_artists.length > 0) {
      const artistIds = await searchArtists(intent.reference_artists, token);
      seedArtists = artistIds.slice(0, 2);
      
      const artistTracks = await getArtistTopTracks(artistIds.slice(0, 3), token);
      allTracks.push(...artistTracks);
      seedTracks = getSeedTracks(artistTracks, 3);
      
      const relatedArtistIds = await getRelatedArtists(artistIds[0], token);
      if (relatedArtistIds.length > 0) {
        const relatedTracks = await getArtistTopTracks(relatedArtistIds.slice(0, 2), token);
        allTracks.push(...relatedTracks);
      }
    }
    
    let searchQuery = intent.original_prompt;
    if (intent.genre && intent.genre !== "any") {
      searchQuery += ` genre:${intent.genre}`;
    }
    
    const searchResults = await searchTracks(searchQuery, token, 30);
    allTracks.push(...searchResults);
    
    if (seedTracks.length < 5) {
      const additionalSeeds = getSeedTracks(searchResults, 5 - seedTracks.length);
      seedTracks = [...seedTracks, ...additionalSeeds];
    }
    
    if (allTracks.length < 10) {
      const broadSearchQuery = intent.mood_tags.join(' ') + ' ' + (intent.genre || '');
      const broadSearchResults = await searchTracks(broadSearchQuery, token, 30);
      allTracks.push(...broadSearchResults);
      
      if (seedTracks.length < 5) {
        const additionalSeeds = getSeedTracks(broadSearchResults, 5 - seedTracks.length);
        seedTracks = [...seedTracks, ...additionalSeeds];
      }
    }
    
    allTracks = combineAndDeduplicateTracks(allTracks);
    
    return { 
      tracks: allTracks,
      seedTracks: seedTracks.slice(0, 5),
      seedArtists: seedArtists.slice(0, 5)
    };
  } catch (error) {
    console.error("Error in search flow:", error);
    throw error;
  }
}

function getSeedTracks(tracks: any[], count: number) {
  const sortedTracks = [...tracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return sortedTracks.slice(0, count).map(track => track.id);
}

function combineAndDeduplicateTracks(trackArrays: any[]) {
  const uniqueTracks = new Map();
  
  const flatTracks = Array.isArray(trackArrays[0]) 
    ? trackArrays.flat() 
    : trackArrays;
  
  for (const track of flatTracks) {
    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, track);
    }
  }
  
  return Array.from(uniqueTracks.values());
}
