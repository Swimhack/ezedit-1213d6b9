
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Update trials that have expired
    const now = new Date().toISOString();
    const { data, error, count } = await supabase
      .from('trial_users')
      .update({ active: false })
      .match({ active: true })
      .lt('expires_at', now);

    if (error) {
      throw error;
    }

    console.log(`Expired ${count} trials at ${now}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Expired ${count} trials`, 
        timestamp: now 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in expire-trials function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to expire trials', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
