
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for saving file content
 */
export async function POST(request: Request) {
  try {
    // Get parameters from request body
    const body = await request.json();
    const { id, filepath, content, originalChecksum, username } = body;
    
    // Validate required fields
    if (!id || !filepath || content === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API saveFile] Saving file: ${filepath}, content length: ${content.length}`);
    
    // Call the Supabase Edge Function to save the file
    const { data, error } = await supabase.functions.invoke("saveFile", {
      body: { id, filepath, content, originalChecksum, username }
    });
    
    if (error) {
      console.error("[API saveFile] Error from Edge Function:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[API saveFile] Exception:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
