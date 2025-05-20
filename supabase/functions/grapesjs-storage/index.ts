
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  console.log(`[GrapesJS Storage] Received ${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const operation = pathParts[pathParts.length - 1];
  
  try {
    if (operation === 'load') {
      // Handle load request
      const body = await req.json();
      const { filename } = body;
      
      console.log(`[GrapesJS Storage] Load request for file: ${filename}`);
      
      if (!filename) {
        return new Response(
          JSON.stringify({ html: '', css: '' }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }
      
      // Implement file loading logic here
      // This is just a placeholder - you'd use your actual file loading mechanism
      const content = "<!DOCTYPE html><html><body><h1>Example Content</h1></body></html>";
      
      return new Response(
        JSON.stringify({ html: content, css: '' }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    } 
    else if (operation === 'save') {
      // Handle save request
      const body = await req.json();
      const { html, css, filename } = body;
      
      console.log(`[GrapesJS Storage] Save request for file: ${filename}, content length: ${html?.length || 0}`);
      
      if (!filename) {
        return new Response(
          JSON.stringify({ error: 'Filename is required' }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }
      
      // Implement file saving logic here
      // This is just a placeholder - you'd use your actual file saving mechanism
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Invalid operation' }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }
  } catch (error) {
    console.error(`[GrapesJS Storage] Error:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});
