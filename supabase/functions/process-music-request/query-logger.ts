
import { supabaseAdmin } from './supabase-admin.ts';

export async function logSearchQuery(userId: string | null, prompt: string, intent: any, advancedParams: any, platforms: string[]) {
  try {
    await supabaseAdmin
      .from('search_queries')
      .insert({
        user_id: userId,
        query_text: prompt,
        genre: advancedParams.activeFilters?.genre ? (advancedParams.genre || intent.genre || null) : null,
        reference_artists: advancedParams.activeFilters?.references ? (advancedParams.referenceArtistIds || intent.reference_artists || []) : [],
        reference_tracks: advancedParams.activeFilters?.references ? (advancedParams.referenceTrackIds || intent.reference_track_ids || []) : [],
        location: advancedParams.activeFilters?.location ? (advancedParams.locations || (intent.market ? [intent.market] : [])) : [],
        platforms: platforms,
        length_minutes: intent.set_length_minutes || null,
        bpm_min: (advancedParams.activeFilters?.bpm && advancedParams.useBpmFilter && advancedParams.bpmRange) ? advancedParams.bpmRange[0] : null,
        bpm_max: (advancedParams.activeFilters?.bpm && advancedParams.useBpmFilter && advancedParams.bpmRange) ? advancedParams.bpmRange[1] : null,
        release_year_min: advancedParams.activeFilters?.releaseYear ? (advancedParams.releaseYearRange ? advancedParams.releaseYearRange[0] : null) : null,
        release_year_max: advancedParams.activeFilters?.releaseYear ? (advancedParams.releaseYearRange ? advancedParams.releaseYearRange[1] : null) : null,
        commercial_factor: advancedParams.activeFilters?.commercial ? advancedParams.commercialFactor || null : null,
        timestamp: new Date().toISOString()
      });
    console.log("[LOG] Search query tracked successfully");
  } catch (logError) {
    console.error("Failed to log search query:", logError);
  }
}
