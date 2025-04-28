
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
    
    const { id, filepath, username } = await req.json();
    
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
      console.error("[deleteFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Make a backup before deletion
    try {
      const { data: fileData } = await supabase.functions.invoke("getFile", { 
        body: { id, filepath } 
      });
      
      if (fileData?.content) {
        const checksum = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fileData.content))
          .then(hash => Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, "0"))
          .join(""));
          
        await supabase.from("ftp_backups").insert({
          connection_id: id,
          path: filepath,
          orig: fileData.content,
          updated: null, // Deletion
          checksum
        });
      }
    } catch (err) {
      console.warn("[deleteFile] Could not get file content for backup:", err);
      // Continue anyway
    }
    
    // Connect to FTP and delete file
    const client = new Client();
    try {
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      await client.remove(filepath);
      
      // Delete file record
      await supabase.from("ftp_files")
        .delete()
        .eq("connection_id", id)
        .eq("path", filepath);
      
      // Remove any locks
      await supabase.from("ftp_file_locks")
        .delete()
        .eq("connection_id", id)
        .eq("path", filepath);
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'file_deleted',
        payload: { filepath, by: username || "anonymous" }
      });
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[deleteFile] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
