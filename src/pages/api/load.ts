
/**
 * API endpoint for loading GrapesJS content
 * 
 * This API route handles requests from GrapesJS to load file content.
 * It forwards requests to the Supabase Edge Function 'grapesjs-storage'
 * and formats responses as expected by GrapesJS.
 * 
 * GrapesJS Documentation Reference:
 * https://grapesjs.com/docs/modules/Storage.html#setup-remote-storage
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for loading GrapesJS content
 */
export async function POST(request: Request) {
  try {
    // Get parameters from request body
    const body = await request.json();
    const { filename, connectionId } = body;
    
    console.log(`[API load] Loading content for: ${filename || 'unnamed file'}, connectionId: ${connectionId || 'missing'}`);
    
    if (!filename || !connectionId) {
      console.log("[API load] Missing filename or connectionId, returning empty content");
      return new Response(JSON.stringify({ html: '', css: '' }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Call the Supabase Edge Function to get the file content
    console.log(`[API load] Invoking grapesjs-storage/load for: ${filename}, connectionId: ${connectionId}`);
    const { data, error } = await supabase.functions.invoke("grapesjs-storage", {
      body: { 
        filename, 
        connectionId,
        operation: 'load' 
      }
    });
    
    if (error) {
      console.error(`[API load] Error from grapesjs-storage: ${error.message}`);
      // Still return a 200 status to prevent GrapesJS from breaking
      return new Response(JSON.stringify({ 
        html: '', 
        css: '',
        error: error.message
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API load] Successfully loaded content for: ${filename}`);
    
    // Return the content in the format GrapesJS expects
    return new Response(JSON.stringify({
      html: data?.html || '',
      css: data?.css || ''
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err: any) {
    console.error("[API load] Exception:", err);
    
    // Always return a 200 status with error info in the response body
    return new Response(JSON.stringify({ 
      html: '', 
      css: '',
      error: err.message || "Unknown error" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
