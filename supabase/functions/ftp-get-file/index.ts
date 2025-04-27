
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
      
      console.log(`[GET-FILE] Accessing path: ${path}`);
      
      // Create a PassThrough stream to collect file data
      const stream = new PassThrough();
      let content = "";
      
      stream.on('data', (chunk) => {
        content += new TextDecoder().decode(chunk);
      });
      
      // Create a promise that resolves when the stream ends
      const streamEnd = new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      
      // Download the file to our stream
      try {
        // Force ASCII mode for text files to avoid binary issues
        await client.send("TYPE A");
        await client.downloadTo(stream, path);
      } catch (downloadError) {
        // Check if this is actually a directory
        try {
          const list = await client.list(path);
          console.log(`[GET-FILE] Path is a directory with ${list.length} items`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              isDirectory: true,
              message: "Path is a directory, not a file" 
            }),
            { status: 400, headers: corsHeaders }
          );
        } catch (dirError) {
          console.error("[GET-FILE] Download error:", downloadError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: downloadError.message || "Failed to download file" 
            }),
            { status: 500, headers: corsHeaders }
          );
        }
      }
      
      // Wait for the stream to complete
      await streamEnd;
      
      // Convert to base64 for safe transport
      const base64Content = btoa(content);
      
      console.log(`[GET-FILE] Successfully downloaded file (${content.length} bytes)`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          content: base64Content 
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
