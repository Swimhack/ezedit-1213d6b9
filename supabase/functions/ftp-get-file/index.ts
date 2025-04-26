
// Supabase Edge (Deno w/ Node polyfills)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";
import { PassThrough, Writable } from "node:stream";   // Node stream polyfilled in Deno
import { supabase } from "./supabaseClient.ts";

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
    const body = await req.json();
    const { siteId, path = "/" } = body;
    
    console.log("[GET-FILE] siteId:", siteId, "path:", path);

    if (!siteId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing siteId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Lookup FTP credentials
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
      
      console.log(`[GET-FILE] Downloading file: ${path}`);
      
      // Create a PassThrough stream to collect file data
      const stream = new PassThrough();
      const chunks: Uint8Array[] = [];
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      // Create a promise that resolves when the stream ends
      const streamEnd = new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      
      // Download the file to our stream
      await client.downloadTo(stream, path);
      
      // Wait for the stream to complete
      await streamEnd;
      
      // Combine all chunks into a single buffer
      const buffer = Buffer.concat(chunks);
      
      // Convert to text and then to base64 for safe transport
      const content = btoa(new TextDecoder().decode(buffer));
      
      console.log(`[GET-FILE] Successfully downloaded file (${buffer.length} bytes)`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          content: content 
        }),
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error("[GET-FILE ERROR]", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error.message || "Failed to download file" 
        }),
        { status: 500, headers: corsHeaders }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error("[GET-FILE] Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
