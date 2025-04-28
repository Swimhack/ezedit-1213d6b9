
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/basic-ftp@5.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
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
    
    const { id, filepath } = await req.json();
    
    if (!id || !filepath) {
      return new Response(
        JSON.stringify({ error: "Connection ID and filepath are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if file is locked by someone else
    const { data: lockData } = await supabase.from("ftp_file_locks")
      .select("locked_by, expires_at")
      .eq("connection_id", id)
      .eq("path", filepath)
      .single();
      
    if (lockData && lockData.expires_at && new Date(lockData.expires_at) > new Date()) {
      return new Response(
        JSON.stringify({ error: "File is locked", lockedBy: lockData.locked_by }),
        { headers: corsHeaders, status: 423 }
      );
    }

    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id } 
    });

    if (credsError) {
      console.error("[getFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
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
        filepath
      );
      
      content = new TextDecoder().decode(new Uint8Array(await new Response(new Blob(chunks)).arrayBuffer()));
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'file_accessed',
        payload: { filepath }
      });
      
      return new Response(
        JSON.stringify({ 
          content,
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
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
