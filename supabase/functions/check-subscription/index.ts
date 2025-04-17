
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    
    // Get profile data from Supabase
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id, is_premium, playlists_generated")
      .eq("id", user.id)
      .single();
      
    if (!profile) {
      return new Response(JSON.stringify({ 
        is_premium: false,
        playlists_generated: 0,
        remaining_generations: 15
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If the user has a Stripe customer ID, check their subscription status
    if (profile.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      });
      
      const isPremium = subscriptions.data.length > 0;
      
      // Update the profile if the premium status has changed
      if (isPremium !== profile.is_premium) {
        await supabaseClient
          .from("profiles")
          .update({ is_premium: isPremium })
          .eq("id", user.id);
      }
      
      return new Response(JSON.stringify({ 
        is_premium: isPremium,
        playlists_generated: profile.playlists_generated || 0,
        remaining_generations: isPremium ? -1 : Math.max(0, 15 - (profile.playlists_generated || 0))
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ 
      is_premium: false,
      playlists_generated: profile.playlists_generated || 0,
      remaining_generations: Math.max(0, 15 - (profile.playlists_generated || 0))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
