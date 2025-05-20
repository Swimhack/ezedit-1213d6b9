
/**
 * API endpoint for saving GrapesJS content
 * 
 * This API route handles requests from GrapesJS to save file content.
 * It forwards requests to the Supabase Edge Function 'grapesjs-storage'
 * and returns responses as expected by GrapesJS.
 * 
 * GrapesJS Documentation Reference:
 * https://grapesjs.com/docs/modules/Storage.html#setup-remote-storage
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for saving GrapesJS content
 */
export async function POST(request: Request) {
  try {
    // Get parameters from request body
    const body = await request.json();
    const { html, css, filename, connectionId } = body;
    
    if (!filename || !connectionId) {
      console.error("[API save] Missing filename or connectionId");
      return new Response(JSON.stringify({ 
        error: "Filename and connectionId are required",
        success: false
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API save] Saving content for: ${filename}, connectionId: ${connectionId}, html length: ${html?.length || 0}`);
    
    // Call the Supabase Edge Function to save the file
    console.log(`[API save] Invoking grapesjs-storage/save for: ${filename}, connectionId: ${connectionId}`);
    const { data, error } = await supabase.functions.invoke("grapesjs-storage", {
      body: { 
        html, 
        css, 
        filename,
        connectionId,
        operation: 'save'
      }
    });
    
    if (error) {
      console.error(`[API save] Error from grapesjs-storage: ${error.message}`);
      // Still return a 200 status to prevent GrapesJS from breaking
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API save] Successfully saved content for: ${filename}`);
    
    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err: any) {
    console.error("[API save] Exception:", err);
    
    // Always return a 200 status with error info in the response body
    return new Response(JSON.stringify({ 
      success: false, 
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
