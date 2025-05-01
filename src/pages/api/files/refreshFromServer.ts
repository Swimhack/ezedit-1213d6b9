
import { supabase } from "@/integrations/supabase/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * API endpoint to refresh directory listing directly from FTP server
 */
export async function POST(req: NextRequest) {
  try {
    const { connectionId, path = "/" } = await req.json();
    
    if (!connectionId) {
      return NextResponse.json({ success: false, message: "Connection ID is required" }, { status: 400 });
    }
    
    console.log(`[API refreshFromServer] Refreshing directory: ${path} for connection: ${connectionId}`);
    
    // Call the Supabase Edge Function directly with no caching
    const response = await supabase.functions.invoke("ftp-list", {
      body: { 
        siteId: connectionId, 
        path,
        refresh: true,  // Signal that this is a forced refresh
        timestamp: Date.now()  // Cache-busting parameter
      }
    });
    
    if (response.error) {
      console.error("[API refreshFromServer] Error:", response.error);
      return NextResponse.json(
        { 
          success: false, 
          message: response.error.message || "Failed to refresh from server" 
        }, 
        { status: 500 }
      );
    }
    
    // Return the fresh data
    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Files refreshed successfully from server"
    });
    
  } catch (error: any) {
    console.error("[API refreshFromServer] Exception:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
