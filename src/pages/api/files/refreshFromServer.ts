
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint for forcing refresh of file listing from FTP server
 */
export async function POST(request: Request) {
  try {
    const { connectionId, path = "/" } = await request.json();
    
    if (!connectionId) {
      return new Response(JSON.stringify({
        success: false,
        message: "Connection ID is required"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API refreshFromServer] Forcing refresh for connection: ${connectionId}, path: ${path}`);
    
    // Force a fresh directory listing from the FTP server
    const response = await supabase.functions.invoke("ftp-list", {
      body: { 
        siteId: connectionId, 
        path: path,
        forceRefresh: true, // Signal that this is a forced refresh
        timestamp: Date.now() // Add timestamp to bust any cache
      }
    });
    
    if (response.error) {
      console.error("[API refreshFromServer] Error from Edge Function:", response.error);
      return new Response(JSON.stringify({
        success: false,
        message: response.error.message || "Failed to refresh directory listing"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API refreshFromServer] Successfully refreshed directory listing, found ${response.data?.files?.length || 0} files`);
    
    return new Response(JSON.stringify({
      success: true,
      data: response.data,
      message: `Successfully refreshed directory listing, found ${response.data?.files?.length || 0} files`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[API refreshFromServer] Exception:", err);
    return new Response(JSON.stringify({
      success: false,
      message: err.message || "Failed to refresh directory listing"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * API endpoint for GET requests (for convenience)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const connectionId = url.searchParams.get('connectionId');
  const path = url.searchParams.get('path') || "/";
  
  if (!connectionId) {
    return new Response(JSON.stringify({
      success: false,
      message: "Connection ID is required"
    }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Create a mock request body for the POST handler
  const mockRequest = new Request("", {
    method: "POST",
    body: JSON.stringify({ connectionId, path })
  });
  
  // Call the POST handler
  return POST(mockRequest);
}
