
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
    
    const { id } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Connection ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get file statistics
    const { data: filesData, error: filesError } = await supabase
      .from("ftp_files")
      .select("path, size, last_modified, updated_at")
      .eq("connection_id", id);
      
    if (filesError) {
      console.error("[getStats] Files query error:", filesError);
      return new Response(
        JSON.stringify({ error: filesError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Get backup statistics
    const { data: backupsData, error: backupsError } = await supabase
      .from("ftp_backups")
      .select("path, created_at")
      .eq("connection_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (backupsError) {
      console.error("[getStats] Backups query error:", backupsError);
      return new Response(
        JSON.stringify({ error: backupsError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Calculate statistics
    const totalFiles = filesData.length;
    const totalSize = filesData.reduce((sum, file) => sum + (file.size || 0), 0);
    
    // Get extensions
    const extensions = {};
    filesData.forEach(file => {
      const ext = file.path.split('.').pop().toLowerCase();
      if (ext && ext.length <= 5) {  // Exclude paths without extension or very long "extensions"
        extensions[ext] = (extensions[ext] || 0) + 1;
      }
    });
    
    // Find most recently modified files
    const recentFiles = [...filesData]
      .sort((a, b) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime())
      .slice(0, 5)
      .map(file => ({
        path: file.path,
        modified: file.last_modified,
        size: file.size
      }));
    
    // Format backups list
    const recentBackups = backupsData.map(backup => ({
      path: backup.path,
      created: backup.created_at
    }));
    
    return new Response(
      JSON.stringify({
        totalFiles,
        totalSize,
        extensions,
        recentFiles,
        recentBackups
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("[getStats] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
