
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    const { id, filepath, username, minutes = 15 } = await req.json();
    
    if (!id || !filepath || !username) {
      return new Response(
        JSON.stringify({ error: "Connection ID, filepath, and username are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if file is already locked
    const { data: lockData } = await supabase.from("ftp_file_locks")
      .select("locked_by, expires_at")
      .eq("connection_id", id)
      .eq("path", filepath)
      .single();
      
    // If locked by someone else and not expired
    if (lockData && lockData.locked_by !== username && lockData.expires_at && new Date(lockData.expires_at) > new Date()) {
      return new Response(
        JSON.stringify({ error: "File is locked by another user", lockedBy: lockData.locked_by }),
        { headers: corsHeaders, status: 423 }
      );
    }
    
    // Calculate expiration (15 minutes by default)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + minutes);
    
    // Create or update lock
    const { error } = await supabase.from("ftp_file_locks").upsert({
      connection_id: id,
      path: filepath,
      locked_by: username,
      expires_at: expires.toISOString()
    });
    
    if (error) {
      console.error("[lockFile] Lock error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Broadcast event via Realtime
    await supabase.channel(`ftp_logs:${id}`).send({
      type: 'broadcast',
      event: 'file_locked',
      payload: { filepath, by: username, expires: expires.toISOString() }
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        expires: expires.toISOString() 
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("[lockFile] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
