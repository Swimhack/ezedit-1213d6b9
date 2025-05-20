
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Client } from "npm:basic-ftp@5.0.4";

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
      const { filename, connectionId } = body;
      
      console.log(`[GrapesJS Storage] Load request for file: ${filename}`);
      
      if (!filename || !connectionId) {
        console.log('[GrapesJS Storage] Missing filename or connectionId, returning empty content');
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
      
      // Call the Supabase Edge Function to get the file content
      console.log(`[GrapesJS Storage] Calling getFtpFile with connectionId: ${connectionId}, filePath: ${filename}`);
      const { data, error } = await supabase.functions.invoke("getFtpFile", {
        body: { connectionId, filePath: filename }
      });
      
      if (error) {
        console.error(`[GrapesJS Storage] Error from getFtpFile: ${error.message}`);
        // Still return a 200 status with empty content to prevent GrapesJS from breaking
        return new Response(
          JSON.stringify({ 
            html: '', 
            css: '',
            error: error.message
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
      
      // Extract the content from the response
      const content = data?.content || '';
      
      console.log(`[GrapesJS Storage] Successfully loaded content for: ${filename}, length: ${content.length}`);
      
      // Return the content in the format GrapesJS expects
      return new Response(
        JSON.stringify({
          html: content,
          css: ''
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
    else if (operation === 'save') {
      // Handle save request
      const body = await req.json();
      const { html, css, filename, connectionId } = body;
      
      console.log(`[GrapesJS Storage] Save request for file: ${filename}, connectionId: ${connectionId}, content length: ${html?.length || 0}`);
      
      if (!filename || !connectionId) {
        console.error('[GrapesJS Storage] Missing filename or connectionId');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Filename and connectionId are required' 
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
      
      // Call the Supabase Edge Function to save the file
      console.log(`[GrapesJS Storage] Calling saveFtpFile with connectionId: ${connectionId}, filePath: ${filename}`);
      const { data, error } = await supabase.functions.invoke("saveFtpFile", {
        body: { 
          connectionId, 
          filePath: filename,
          content: html || ''
        }
      });
      
      if (error) {
        console.error(`[GrapesJS Storage] Error from saveFtpFile: ${error.message}`);
        // Still return a 200 status with error info to prevent GrapesJS from breaking
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
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
      
      console.log(`[GrapesJS Storage] Successfully saved content for: ${filename}`);
      
      // Return success response
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
      console.error(`[GrapesJS Storage] Invalid operation: ${operation}`);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid operation',
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
  } catch (error) {
    console.error(`[GrapesJS Storage] Error:`, error);
    
    // Always return a 200 status with error info in the response body
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
