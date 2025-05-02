
// Supabase Edge (Deno w/ Node polyfills)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";
import { getFtpCreds } from "../_shared/creds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
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
    console.error("[FTP-LIST] Date formatting error:", e, "Value:", dateInput);
    // Return current date as fallback
    return new Date().toISOString();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { siteId, path = "/" } = await req.json();
    console.log(`[FTP-LIST] Listing directory for siteId: ${siteId}, path: ${path}`);
    
    const creds = await getFtpCreds(siteId);
    if (!creds) {
      return new Response(
        JSON.stringify({ success: false, message: "Unknown siteId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const client = new Client();
    client.ftp.verbose = true; // Enable verbose logging
    
    try {
      await client.access({
        host: creds.host,
        user: creds.user,
        password: creds.password,
        port: creds.port,
        secure: false
      });
      
      console.log(`[FTP-LIST] Connected to FTP server. Listing path: "${path}"`);
      
      let list = [];
      let usedMLSD = false;
      
      // Try MLSD first (more standardized format with better timestamps)
      try {
        list = await client.listFeatures(path);
        usedMLSD = true;
        console.log(`[FTP-LIST] Successfully used MLSD to list directory "${path}". Found ${list.length} entries`);
      } catch (mlsdError) {
        // Fallback to standard LIST command
        console.log(`[FTP-LIST] MLSD failed, falling back to LIST: ${mlsdError.message}`);
        list = await client.list(path);
        console.log(`[FTP-LIST] Successfully listed directory "${path}" with LIST. Found ${list.length} entries`);
      }
      
      // Format entries using the exact server-provided values but with safer date handling
      const formattedEntries = list.map(entry => {
        // Handle modification date safely
        let modifiedDate = null;
        
        if (usedMLSD && entry.rawModifiedAt) {
          // MLSD provides more accurate timestamps
          modifiedDate = safeFormatDate(entry.rawModifiedAt);
        } else if (entry.modifiedAt) {
          modifiedDate = safeFormatDate(entry.modifiedAt);
        } else if (entry.date) {
          modifiedDate = safeFormatDate(entry.date);
        } else {
          modifiedDate = safeFormatDate(new Date());
        }
        
        return {
          name: entry.name,
          type: entry.isDirectory ? "directory" : "file",
          size: entry.size || 0,
          modified: modifiedDate,
          isDirectory: entry.isDirectory,
          path: `${path === "/" ? "" : path}/${entry.name}`.replace(/\/+/g, "/")
        };
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          files: formattedEntries,
          source: usedMLSD ? "MLSD" : "LIST"
        }),
        { headers: corsHeaders }
      );
    } catch (e) {
      console.error("[FTP-LIST] Error:", e);
      return new Response(
        JSON.stringify({ success: false, message: e.message || "FTP listing failed" }),
        { status: 500, headers: corsHeaders }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error("[FTP-LIST] Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
