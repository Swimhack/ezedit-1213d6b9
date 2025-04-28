
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
    
    const { id, oldPath, newPath, username } = await req.json();
    
    if (!id || !oldPath || !newPath) {
      return new Response(
        JSON.stringify({ error: "Connection ID, old path and new path are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if file is locked by someone else
    const { data: lockData } = await supabase.from("ftp_file_locks")
      .select("locked_by, expires_at")
      .eq("connection_id", id)
      .eq("path", oldPath)
      .single();
      
    if (lockData && lockData.expires_at && new Date(lockData.expires_at) > new Date() && lockData.locked_by !== username) {
      return new Response(
        JSON.stringify({ error: "File is locked by another user", lockedBy: lockData.locked_by }),
        { headers: corsHeaders, status: 423 }
      );
    }

    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id } 
    });

    if (credsError) {
      console.error("[renameFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Connect to FTP and rename file
    const client = new Client();
    try {
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      await client.rename(oldPath, newPath);
      
      // Update file record
      await supabase.from("ftp_files")
        .update({
          path: newPath,
          updated_at: new Date().toISOString()
        })
        .eq("connection_id", id)
        .eq("path", oldPath);
      
      // Update any locks
      await supabase.from("ftp_file_locks")
        .update({ path: newPath })
        .eq("connection_id", id)
        .eq("path", oldPath);
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'file_renamed',
        payload: { oldPath, newPath, by: username || "anonymous" }
      });
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[renameFile] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
