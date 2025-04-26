
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";
import { supabase } from "./supabaseClient.ts";
import { PassThrough } from "npm:stream@0.0.2";

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

    const absPath = path.startsWith("/") ? path : `/${path}`;
    const client = new Client();
    
    try {
      await client.access({
        host: creds.host,
        port: creds.port,
        user: creds.user,
        password: creds.password,
        secure: false
      });

      // Create a PassThrough stream to collect data chunks
      const chunks = [];
      const stream = new PassThrough();
      
      // Add event listeners to collect chunks
      stream.on("data", (chunk) => {
        chunks.push(chunk);
      });
      
      // Wait for the download to complete using a promise
      const downloadPromise = new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });
      
      // Start the download - stream satisfies the .once() requirement
      await client.downloadTo(stream, absPath);
      
      // Wait for the download to complete
      await downloadPromise;
      
      // Convert chunks to a single buffer and then to a string
      const buffer = chunks.length > 0 ? Buffer.concat(chunks) : Buffer.alloc(0);
      const fileContent = buffer.toString('utf-8');
      
      // Convert to base64 for safe transport
      const base64Content = btoa(fileContent);
      
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
    console.error("Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
