
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { createStructuredIntent } from './intent-analyzer.ts';
import { processTracksRequest } from './tracks-processor.ts';
import { logSearchQuery } from './query-logger.ts';
import { createErrorResponse, createSuccessResponse } from './response-utils.ts';
import { supabaseAdmin } from './supabase-admin.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    if (!req.body) {
      throw new Error("Request body is required");
    }

    // Get user ID from auth header if present
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      }
    } catch (err) {
      console.error("Error retrieving user from auth header:", err);
    }

    const { prompt, advancedParams, platforms = ['spotify', 'youtube'] } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error("A valid text prompt is required");
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      throw new Error("At least one platform must be selected");
    }

    console.log("Request received:", { prompt, advancedParams, platforms });
    console.log("Active filters:", advancedParams.activeFilters || "no active filters specified");

    // Intent Analysis
    const intent = await createStructuredIntent(prompt, advancedParams);
    console.log("Created structured intent:", JSON.stringify(intent, null, 2));

    // Add active filters to intent
    intent.activeFilters = advancedParams.activeFilters || {
      genre: true,
      location: true,
      releaseYear: true,
      commercial: true,
      references: true,
      bpm: false
    };

    // Log search query
    await logSearchQuery(userId, prompt, intent, advancedParams, platforms);

    // Process tracks request
    const finalPlaylist = await processTracksRequest(prompt, advancedParams, platforms, intent);

    return createSuccessResponse(finalPlaylist);
  } catch (error) {
    console.error("Error processing music request:", error);
    return createErrorResponse(error);
  }
});
