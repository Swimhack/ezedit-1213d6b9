
// Deno runtime — use a Deno-native client
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FTPClient } from "https://deno.land/x/ftpdeno@v0.6.0/mod.ts";
import { supabase } from "../ftp-get-file/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Content-Type': 'application/json'
};

async function getFtpCreds(siteId) {
  const { data, error } = await supabase
    .from("ftp_connections")
    .select("host, username, password, port")
    .eq("id", siteId)
    .single();

  if (error) {
    console.error("Error fetching FTP credentials:", error);
    return null;
  }

  return {
    host: data.host,
    user: data.username,
    password: data.password,
    port: data.port || 21
  };
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

    const client = new FTPClient();
    try {
      await client.connect({
        host: creds.host,
        user: creds.user,
        pass: creds.password,
        port: creds.port,
        secure: false
      });
      
      console.log(`[FTP-LIST] Connected to FTP server. Listing path: "${path}"`);
      
      const entries = await client.list(path);
      console.log(`[FTP-LIST] Successfully listed directory "${path}". Found ${entries.length} entries`);
      
      // Format entries to match our expected FtpEntry type
      const formattedEntries = entries.map(entry => ({
        name: entry.name,
        type: entry.type === "dir" ? "directory" : "file",
        size: entry.size || 0,
        modified: entry.time ? entry.time.toISOString() : new Date().toISOString(),
        isDirectory: entry.type === "dir"
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
