
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
    
    const { id, filepath, content, originalChecksum, username } = await req.json();
    
    if (!id || !filepath || content === undefined) {
      return new Response(
        JSON.stringify({ error: "Connection ID, filepath, and content are required" }),
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
      console.error("[saveFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Get current file content for backup and checksum validation
    let currentContent = "";
    try {
      const { data: fileData, error } = await supabase.functions.invoke("getFile", { 
        body: { id, filepath } 
      });
      
      if (!error && fileData?.content) {
        currentContent = fileData.content;
        
        // Verify checksum if provided
        if (originalChecksum && fileData.checksum !== originalChecksum) {
          return new Response(
            JSON.stringify({ error: "File has been modified since you opened it" }),
            { headers: corsHeaders, status: 409 }
          );
        }
      }
    } catch (err) {
      console.warn("[saveFile] Could not get current file content:", err);
      // Continue anyway, might be a new file
    }
    
    // Create backup if file exists
    if (currentContent) {
      const checksum = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(currentContent))
        .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""));
        
      await supabase.from("ftp_backups").insert({
        connection_id: id,
        path: filepath,
        orig: currentContent,
        updated: content,
        checksum
      });
    }
    
    // Connect to FTP and save file
    const client = new Client();
    try {
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      // Upload content
      const encoder = new TextEncoder();
      const contentBuffer = encoder.encode(content);
      
      await client.uploadFrom(
        new ReadableStream({
          start(controller) {
            controller.enqueue(contentBuffer);
            controller.close();
          }
        }),
        filepath
      );
      
      // Update file record
      await supabase.from("ftp_files").upsert({
        connection_id: id,
        path: filepath,
        size: contentBuffer.byteLength,
        last_modified: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Release lock if we had one
      if (username) {
        await supabase.from("ftp_file_locks")
          .delete()
          .eq("connection_id", id)
          .eq("path", filepath)
          .eq("locked_by", username);
      }
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'file_updated',
        payload: { filepath, by: username || "anonymous" }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
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
    console.error("[saveFile] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
