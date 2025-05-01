
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for listing files in a directory
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const connectionId = url.searchParams.get('connectionId');
    
    if (!connectionId) {
      return new Response("Connection ID parameter is required", { status: 400 });
    }
    
    console.log(`[API listFiles] Listing directory: ${path || '/'} for connection: ${connectionId}`);
    
    // Call the Supabase Edge Function to list files
    const { data, error } = await supabase.functions.invoke("ftp-list", {
      body: { siteId: connectionId, path: path || "/" }
    });
    
    if (error) {
      console.error("[API listFiles] Error from Edge Function:", error);
      return new Response(error.message, { status: 500 });
    }
    
    if (!data || !data.files) {
      return new Response("Directory not found or empty", { status: 404 });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[API listFiles] Exception:", err);
    return new Response(err.message || "Unknown error", { status: 500 });
  }
}
