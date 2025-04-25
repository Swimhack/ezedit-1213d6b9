
import { Client } from 'basic-ftp';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, username, password, port = 21 } = await req.json();
    const client = new Client();

    try {
      await client.access({
        host,
        user: username,
        password,
        port,
        secure: false,
        passive: true,
      });

      const list = await client.list();
      return new Response(
        JSON.stringify({ success: true, files: list }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
