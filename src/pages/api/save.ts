
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for saving GrapesJS content
 */
export async function POST(request: Request) {
  try {
    // Get parameters from request body
    const body = await request.json();
    const { html, css, filename } = body;
    
    if (!filename) {
      console.error("[API save] No filename provided");
      return new Response(JSON.stringify({ error: "Filename is required" }), {
        status: 200,  // Still return 200 to prevent GrapesJS from breaking
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API save] Saving content for: ${filename}, html length: ${html?.length || 0}`);
    
    // Call the Supabase Edge Function to save the file
    const { data, error } = await supabase.functions.invoke("saveFtpFile", {
      body: { 
        filePath: filename,
        content: html
      }
    });
    
    if (error) {
      console.error("[API save] Error saving file content:", error);
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
