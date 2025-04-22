
import { corsHeaders } from './cors.ts';

export function calculateConfidenceScore(tracks: any[]): number {
  if (!tracks.length) return 0;
  const avgScore = tracks.reduce((sum, track) => sum + (track.match_score || 0), 0) / tracks.length;
  return Math.round(avgScore);
}

export function categorizeError(error: Error): string {
  if (error.message.includes("Spotify")) return "SPOTIFY_API_ERROR";
  if (error.message.includes("YouTube")) return "YOUTUBE_API_ERROR";
  if (error.message.includes("prompt")) return "INVALID_INPUT";
  if (error.message.includes("No tracks")) return "NO_RESULTS";
  if (error.message.includes("authenticate")) return "AUTH_ERROR";
  return "UNKNOWN_ERROR";
}

export function determineErrorStatus(error: Error): number {
  if (error.message.includes("required") || !error.message) return 400;
  if (error.message.includes("authenticate")) return 401;
  if (error.message.includes("No tracks") || error.message.includes("Failed to score")) return 404;
  return 500;
}

export function calculateObscurityLevel(commercialFactor: number): number {
  if (commercialFactor === undefined || commercialFactor === null) return 0.5;
  return 1 - (commercialFactor / 100);
}

export function createErrorResponse(error: Error) {
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

export function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
