
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/basic-ftp@5.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store"
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { siteId, path, timestamp } = await req.json();
    
    if (!siteId || !path) {
      return new Response(
        JSON.stringify({ success: false, message: "Connection ID and filepath are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Log if cache busting is being used
    if (timestamp) {
      console.log(`[FTP-GET-FILE] Cache busting timestamp: ${timestamp}`);
    }

    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id: siteId } 
    });

    if (credsError) {
      console.error("[getFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ success: false, message: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Connect to FTP and get file
    const client = new Client();
    try {
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      // Download file content to memory
      let content = "";
      const chunks = [];
      await client.downloadTo(
        new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          }
        }),
        path
      );
      
      content = new TextDecoder().decode(new Uint8Array(await new Response(new Blob(chunks)).arrayBuffer()));
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${siteId}`).send({
        type: 'broadcast',
        event: 'file_accessed',
        payload: { path }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content,
          timestamp: Date.now(), // Include timestamp for cache verification
          checksum: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content))
            .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, "0"))
            .join(""))
        }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[getFile] Exception:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
