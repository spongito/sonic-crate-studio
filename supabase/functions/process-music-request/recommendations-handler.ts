
import { getRecommendations } from './spotify-client.ts';

export async function processRecommendations(
  platforms: string[],
  spotifyToken: string | null,
  seedTracks: string[] | null,
  seedArtists: string[] | null,
  intent: any
): Promise<any[]> {
  let recommendedTracks = [];
  
  if (platforms.includes('spotify') && spotifyToken && seedTracks && seedTracks.length > 0) {
    try {
      recommendedTracks = await getRecommendations(seedTracks, seedArtists, intent, spotifyToken).catch(error => {
        console.error("Recommendations failed:", error);
        return [];
      });
      console.log(`Found ${recommendedTracks.length} tracks through recommendations`);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  }
  
  return recommendedTracks;
}
