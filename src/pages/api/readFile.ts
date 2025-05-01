
import { supabase } from "@/integrations/supabase/client";

// Helper function to add delay between retries
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * API endpoint for reading file content with cache busting and retry mechanism
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const timestamp = url.searchParams.get('t'); // Cache busting parameter
    
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
    
    console.log(`[API readFile] Reading file: ${filePath} from connection ${connectionId} (cache timestamp: ${timestamp || 'none'})`);
    
    // First attempt to call the Supabase Edge Function
    let response = await supabase.functions.invoke("sftp-file", {
      body: { 
        siteId: connectionId, 
        path: filePath,
        timestamp // Pass timestamp to edge function for its own cache control
      }
    });
    
    // Check if the first attempt failed or returned invalid data
    if (response.error || !response.data || !response.data.content) {
      console.warn(`[API readFile] First attempt failed or empty content, waiting 2 seconds before retry...`);
      await sleep(2000); // 2-second delay before retry
      
      // Second attempt after delay
      console.log(`[API readFile] Retrying file read: ${filePath} from connection ${connectionId}`);
      response = await supabase.functions.invoke("sftp-file", {
        body: { 
          siteId: connectionId, 
          path: filePath,
          timestamp: Date.now() // Fresh timestamp for retry
        }
      });
    }
    
    if (response.error) {
      console.error("[API readFile] Error from Edge Function after retry:", response.error);
      return new Response(response.error.message, { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache"
        }
      });
    }
    
    if (!response.data || !response.data.content) {
      return new Response("File not found or empty after retry", { 
        status: 404,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache"
        } 
      });
    }
    
    return new Response(response.data.content, {
      status: 200,
      headers: { 
        "Content-Type": "text/plain",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache"
      }
    });
  } catch (err: any) {
    console.error("[API readFile] Exception:", err);
    return new Response(err.message || "Unknown error", { 
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache"
      }
    });
  }
}
