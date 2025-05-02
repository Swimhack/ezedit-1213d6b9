
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Helper to safely format a date, handling various formats
function safeFormatDate(dateInput: any): string | null {
  if (!dateInput) return null;
  
  try {
    // Handle string dates
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return dateInput;
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      if (!isNaN(dateInput.getTime())) {
        return dateInput.toISOString();
      }
      return new Date().toISOString(); // Use current date as fallback for invalid dates
    }
    
    // Handle timestamps
    if (typeof dateInput === 'number') {
      if (isNaN(dateInput) || dateInput < 0) {
        return new Date().toISOString();
      }
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return new Date().toISOString();
    }
    
    // If it's an object with a toString method
    if (dateInput && typeof dateInput.toString === 'function') {
      try {
        const dateStr = dateInput.toString();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        // Fall through to default
      }
    }
    
    // Return current date as fallback
    return new Date().toISOString();
  } catch (e) {
    console.error("[FTP-LIST-DIRECTORY] Date formatting error:", e, "Value:", dateInput);
    // Return current date as fallback
    return new Date().toISOString();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port = 21, username, password, path = "/" } = await req.json();

    if (!host || !username || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields: host, username, or password" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure path is never empty; default to root path "/"
    const safePath = path?.trim() === "" ? "/" : path;

    console.log(`[FTP-LIST-DIRECTORY] Attempting to list FTP directory for ${username}@${host}:${port} path:"${safePath}"`);

    const client = new Client();
    client.ftp.verbose = true; // Enable verbose logging for debugging
    
    try {
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: false
      });

      console.log(`[FTP-LIST-DIRECTORY] Connected to FTP server. Listing path: "${safePath}"`);
      
      let list = [];
      let usedMLSD = false;
      
      // Try MLSD first (more standardized format with better timestamps)
      try {
        list = await client.listFeatures(safePath);
        usedMLSD = true;
        console.log(`[FTP-LIST-DIRECTORY] Successfully used MLSD for directory "${safePath}". Found ${list.length} entries`);
      } catch (mlsdError) {
        // Fallback to standard LIST command
        console.log(`[FTP-LIST-DIRECTORY] MLSD failed, falling back to LIST: ${mlsdError.message}`);
        list = await client.list(safePath);
        console.log(`[FTP-LIST-DIRECTORY] Successfully listed directory "${safePath}" with LIST. Found ${list.length} entries`);
      }
      
      // Format entries with proper date handling
      const files = list.map(item => {
        // Handle modification date safely
        let modifiedDate = null;
        
        if (usedMLSD && item.rawModifiedAt) {
          // MLSD provides more accurate timestamps
          modifiedDate = safeFormatDate(item.rawModifiedAt);
        } else if (item.modifiedAt) {
          modifiedDate = safeFormatDate(item.modifiedAt);
        } else if (item.date) {
          modifiedDate = safeFormatDate(item.date);
        } else {
          modifiedDate = safeFormatDate(new Date());
        }
        
        return {
          name: item.name,
          size: item.size,
          modified: modifiedDate,
          type: item.isDirectory ? "directory" : "file",
          isDirectory: item.isDirectory,
          path: `${safePath === "/" ? "" : safePath}/${item.name}`.replace(/\/+/g, "/")
        };
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          files,
          path: safePath,
          source: usedMLSD ? "MLSD" : "LIST"
        }),
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error(`[FTP-LIST-DIRECTORY] FTP listing error for path "${safePath}":`, error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error.message || "Failed to list directory contents",
          path: safePath
        }),
        { status: 400, headers: corsHeaders }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('[FTP-LIST-DIRECTORY] Request processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Invalid request format" 
      }),
      { status: 400, headers: corsHeaders }
    );
  }
});
