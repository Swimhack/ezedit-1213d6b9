
// Supabase Edge (Deno w/ Node polyfills)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";
import { PassThrough, Writable } from "node:stream";   // Node stream polyfilled in Deno
import { getFtpCreds } from "../_shared/creds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Content-Type': 'application/json'
};

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
    try {
      await client.access({
        host: creds.host,
        user: creds.user,
        password: creds.password,
        port: creds.port,
        secure: false
      });
      
      console.log(`[FTP-LIST] Connected to FTP server. Listing path: "${path}"`);
      
      const list = await client.list(path);
      console.log(`[FTP-LIST] Successfully listed directory "${path}". Found ${list.length} entries`);
      
      // Format entries to match our expected FtpEntry type
      const formattedEntries = list.map(entry => ({
        name: entry.name,
        type: entry.isDirectory ? "directory" : "file",
        size: entry.size || 0,
        modified: entry.modifiedAt ? entry.modifiedAt.toISOString() : new Date().toISOString(),
        isDirectory: entry.isDirectory
      }));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          files: formattedEntries 
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
