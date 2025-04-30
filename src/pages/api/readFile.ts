
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for reading file content
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response("Path parameter is required", { status: 400 });
    }
    
    // Extract connection ID from path (assuming it's in the format "connectionId:/path/to/file")
    const parts = path.split(':', 2);
    const connectionId = parts[0];
    const filePath = parts.length > 1 ? parts[1] : path;
    
    if (!connectionId) {
      return new Response("Invalid path format, connection ID is required", { status: 400 });
    }
    
    console.log(`[API readFile] Reading file: ${filePath} from connection ${connectionId}`);
    
    // Call the Supabase Edge Function to read the file
    const { data, error } = await supabase.functions.invoke("sftp-file", {
      body: { siteId: connectionId, path: filePath }
    });
    
    if (error) {
      console.error("[API readFile] Error from Edge Function:", error);
      return new Response(error.message, { status: 500 });
    }
    
    if (!data || !data.content) {
      return new Response("File not found or empty", { status: 404 });
    }
    
    return new Response(data.content, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  } catch (err: any) {
    console.error("[API readFile] Exception:", err);
    return new Response(err.message || "Unknown error", { status: 500 });
  }
}
