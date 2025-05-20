
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for loading GrapesJS content
 */
export async function POST(request: Request) {
  try {
    // Get parameters from request body
    const body = await request.json();
    const { filename } = body;
    
    console.log(`[API load] Loading content for: ${filename || 'unnamed file'}`);
    
    if (!filename) {
      console.log("[API load] No filename provided, returning empty content");
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
    const { data, error } = await supabase.functions.invoke("getFtpFile", {
      body: { filePath: filename }
    });
    
    if (error) {
      console.error("[API load] Error loading file content:", error);
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
      html: data?.content || '',
      css: ''  // You might extract CSS if needed
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
