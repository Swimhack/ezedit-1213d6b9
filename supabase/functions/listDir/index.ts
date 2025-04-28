
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
    
    const { id, path = "/" } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Connection ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id } 
    });

    if (credsError) {
      console.error("[listDir] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Connect to FTP
    const client = new Client();
    let files = [];
    
    try {
      console.log(`[listDir] Connecting to ${credsData.host}:${credsData.port}`);
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      console.log(`[listDir] Listing directory: ${path}`);
      const list = await client.list(path);
      
      files = list.map(item => ({
        name: item.name,
        isDirectory: item.type === 2 || item.type === 'd',
        size: item.size,
        modified: new Date(item.modifiedAt || Date.now()).toISOString()
      }));
      
      // Store file info in database
      for (const file of files) {
        if (!file.isDirectory) {
          await supabase.from("ftp_files").upsert({
            connection_id: id,
            path: path + (path.endsWith('/') ? '' : '/') + file.name,
            size: file.size,
            last_modified: file.modified,
            updated_at: new Date().toISOString()
          }).select();
        }
      }
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'directory_listed',
        payload: { path, count: files.length }
      });
      
      return new Response(
        JSON.stringify({ files }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[listDir] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
